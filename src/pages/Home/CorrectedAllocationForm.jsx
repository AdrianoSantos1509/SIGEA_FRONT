import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api.js";

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const SHIFT_TIMES = {
  MATUTINO: { startTime: "08:00", endTime: "12:00" },
  VESPERTINO: { startTime: "14:00", endTime: "18:00" },
  NOTURNO: { startTime: "19:00", endTime: "22:00" },
};
const validDateRange = (start, end) => Boolean(start && end && start <= end);
const validTimeRange = (start, end) => Boolean(start && end && start < end);
const formatTime = (value) => String(value || "").slice(0, 5);
const displayName = (value) => String(value || "").trim().toLocaleUpperCase("pt-BR");

function shiftFromTimes(startTime, endTime) {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return Object.entries(SHIFT_TIMES).find(([, times]) => times.startTime === start && times.endTime === end)?.[0] || "MATUTINO";
}

export default function CorrectedAllocationForm({ courses, rooms, initialCourse, initialData, date, buildingId, onSave }) {
  const initialShift = initialData?.shift || initialCourse?.shift || shiftFromTimes(initialData?.startTime || initialCourse?.startTime, initialData?.endTime || initialCourse?.endTime);
  const initialTimes = SHIFT_TIMES[initialShift] || {};
  const [data, setData] = useState({
    courseId: initialData?.course?.id || initialData?.courseId || initialCourse?.id || "",
    instructorId: initialData?.instructor?.id || initialData?.instructorId || initialCourse?.teacher?.id || "",
    classroomId: initialData?.classroom?.id || initialData?.classroomId || "",
    title: initialData?.title || (initialCourse ? `${initialCourse.code} · ${initialCourse.name}` : ""),
    kind: initialData?.kind || (initialCourse ? "TURMA" : "RESERVA"),
    status: initialData?.status || "ATIVA",
    shift: initialShift,
    startDate: initialData?.startDate || initialCourse?.startDate || date,
    endDate: initialData?.endDate || initialCourse?.endDate || date,
    startTime: formatTime(initialData?.startTime || initialCourse?.startTime) || initialTimes.startTime || "08:00",
    endTime: formatTime(initialData?.endTime || initialCourse?.endTime) || initialTimes.endTime || "12:00",
    weekdays: initialData?.weekdays || initialCourse?.weekdays || ["SEG", "TER", "QUA", "QUI", "SEX"],
    notes: initialData?.notes || "",
  });
  const [roomResult, setRoomResult] = useState({ rooms: [], totalActiveRooms: 0 });
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const selectedCourse = courses.find((course) => course.id === Number(data.courseId));
  const roomBuildingId = selectedCourse?.building?.id || initialData?.course?.building?.id || buildingId;
  const availableCourses = useMemo(() => {
    return courses.filter((course) => {
      if (initialData?.course?.id === course.id || initialCourse?.id === course.id) return true;
      return !course.occupancies?.some((occupancy) => occupancy.status !== "CANCELADA");
    });
  }, [courses, initialData, initialCourse]);
  const localRoomsInBuilding = useMemo(
    () => rooms.filter((room) => !roomBuildingId || Number(room.building?.id) === Number(roomBuildingId)),
    [rooms, roomBuildingId],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      if (!validDateRange(data.startDate, data.endDate) || !validTimeRange(data.startTime, data.endTime) || !data.weekdays.length) {
        setRoomResult({ rooms: [], totalActiveRooms: 0 });
        setAvailableInstructors([]);
        return;
      }
      setChecking(true);
      setError("");
      try {
        const roomQuery = new URLSearchParams({
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          weekdays: data.weekdays.join(","),
        });
        if (data.courseId) roomQuery.set("courseId", data.courseId);
        if (roomBuildingId) roomQuery.set("buildingId", roomBuildingId);
        if (initialData?.id) roomQuery.set("excludeOccupancyId", initialData.id);
        const instructorQuery = new URLSearchParams({
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          weekdays: data.weekdays.join(","),
        });
        if (initialData?.id) instructorQuery.set("excludeOccupancyId", initialData.id);
        const [roomPayload, instructors] = await Promise.all([
          api(`/api/classrooms/availability?${roomQuery}`),
          api(`/api/teachers/availability?${instructorQuery}`),
        ]);
        if (cancelled) return;
        const queriedRooms = Array.isArray(roomPayload) ? roomPayload : roomPayload.rooms || [];
        setRoomResult({
          rooms: queriedRooms.filter((room) => room.available),
          totalActiveRooms: roomPayload.meta?.totalActiveRooms ?? queriedRooms.length,
        });
        setAvailableInstructors(instructors);
      } catch (requestError) {
        if (!cancelled) {
          setRoomResult({ rooms: [], totalActiveRooms: 0 });
          setAvailableInstructors([]);
          setError(requestError.message || "Não foi possível consultar a disponibilidade agora.");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    loadAvailability();
    return () => { cancelled = true; };
  }, [data.startDate, data.endDate, data.startTime, data.endTime, data.weekdays, data.courseId, roomBuildingId, initialData?.id]);

  function selectCourse(event) {
    const course = courses.find((item) => item.id === Number(event.target.value));
    const shift = course?.shift || shiftFromTimes(course?.startTime, course?.endTime);
    const times = SHIFT_TIMES[shift] || {};
    setData((current) => ({
      ...current,
      courseId: event.target.value,
      instructorId: course?.teacher?.id || "",
      classroomId: "",
      title: course ? `${course.code} · ${course.name}` : current.title,
      startDate: course?.startDate || current.startDate,
      endDate: course?.endDate || current.endDate,
      shift,
      startTime: times.startTime || formatTime(course?.startTime) || current.startTime,
      endTime: times.endTime || formatTime(course?.endTime) || current.endTime,
      weekdays: course?.weekdays?.length ? course.weekdays : current.weekdays,
      kind: course ? "TURMA" : "RESERVA",
    }));
  }

  function selectShift(event) {
    const shift = event.target.value;
    const times = SHIFT_TIMES[shift];
    setData((current) => ({ ...current, shift, startTime: times.startTime, endTime: times.endTime, classroomId: "", instructorId: selectedCourse?.teacher?.id || current.instructorId }));
  }

  function submit(event) {
    event.preventDefault();
    if (!data.classroomId) return setError("Selecione uma sala disponível.");
    if (!validDateRange(data.startDate, data.endDate) || !validTimeRange(data.startTime, data.endTime)) return setError("Período ou horário inválido.");
    if (!data.weekdays.length) return setError("Selecione pelo menos um dia de execução.");
    if (selectedCourse && !data.instructorId) return setError("Selecione um instrutor disponível para a turma.");
    setError("");
    onSave({ ...data, title: String(data.title || "").trim().toLocaleUpperCase("pt-BR"), shift: data.shift.toLocaleUpperCase("pt-BR") });
  }

  const noRoomsMessage = error
    ? error
    : roomResult.totalActiveRooms === 0
      ? "Não há salas ativas cadastradas para a unidade desta turma."
      : "As salas ativas desta unidade têm conflito real com o período, horário ou dias selecionados.";

  const selectedInstructorIsAvailable = data.instructorId && availableInstructors.some((instructor) => instructor.id === Number(data.instructorId));
  // Quando uma turma está selecionada, o período/horário/dias vêm herdados dela
  // (ver selectCourse acima) e ficam bloqueados aqui — só uma "Reserva avulsa"
  // (sem turma vinculada) permite editar esses campos livremente.
  const lockedByCourse = Boolean(data.courseId);
  // FIX: .filter(Boolean) remove os `undefined` (ex.: initialData?.instructor quando
  // initialData não existe) ANTES do findIndex de deduplicação rodar. Sem isso, o
  // findIndex percorria um array com `undefined` dentro e quebrava ao ler `candidate.id`.
  // Também força a entrada do instrutor já vinculado à turma (selectedCourse.teacher),
  // mesmo que a consulta de disponibilidade ainda não o tenha confirmado — assim ele
  // já aparece pré-selecionado ao escolher a turma, sem precisar buscar de novo.
  const instructorOptions = selectedInstructorIsAvailable || initialData?.instructor || selectedCourse?.teacher
    ? [initialData?.instructor, selectedCourse?.teacher, ...availableInstructors]
        .filter(Boolean)
        .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    : availableInstructors;
  const selectedRoomIsAvailable = data.classroomId && roomResult.rooms.some((room) => room.id === Number(data.classroomId));
  // FIX: mesma correção aplicada às salas.
  const roomOptions = selectedRoomIsAvailable || initialData?.classroom
    ? [initialData?.classroom, ...roomResult.rooms]
        .filter(Boolean)
        .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    : roomResult.rooms;

  return <form className="entity-form" onSubmit={submit} noValidate>
    {error && <div className="form-error" role="alert">{error}</div>}
    <label>Turma (opcional)
      <select value={data.courseId} onChange={selectCourse} disabled={Boolean(initialCourse && !initialData)}>
        <option value="">Reserva ou bloqueio avulso</option>
        {(initialCourse && !availableCourses.some((course) => course.id === initialCourse.id) ? [initialCourse, ...availableCourses] : availableCourses).map((course) => <option value={course.id} key={course.id}>{displayName(course.code)} · {displayName(course.name)}</option>)}
      </select>
    </label>
    <label>Instrutor
      <select value={data.instructorId} onChange={(event) => setData((current) => ({ ...current, instructorId: event.target.value }))} disabled={checking}>
        <option value="">{checking ? "CONSULTANDO INSTRUTORES..." : instructorOptions.length ? "SELECIONE O INSTRUTOR DISPONÍVEL" : "NENHUM INSTRUTOR ATIVO DISPONÍVEL NESTE HORÁRIO"}</option>
        {instructorOptions.map((instructor) => <option value={instructor.id} key={instructor.id}>{displayName(instructor.name)}{instructor.segment ? ` · ${displayName(instructor.segment)}` : ""}</option>)}
      </select>
    </label>
    <label>Sala
      <select required value={data.classroomId} onChange={(event) => setData((current) => ({ ...current, classroomId: event.target.value }))} disabled={checking}>
        <option value="">{checking ? "CONSULTANDO SALAS..." : roomOptions.length ? "SELECIONE A SALA DISPONÍVEL" : "NENHUMA SALA DISPONÍVEL"}</option>
        {roomOptions.map((room) => <option value={room.id} key={room.id}>{displayName(room.building?.name)} · {displayName(room.name)} ({room.capacity})</option>)}
      </select>
    </label>
    {!checking && !roomResult.rooms.length && !initialData?.classroom && <p className="form-hint availability-empty">{noRoomsMessage}</p>}
    {!checking && !availableInstructors.length && !initialData?.instructor && !error && <p className="form-hint availability-empty">Não há instrutores ativos disponíveis para o período, horário e dias selecionados.</p>}
    <div className="form-grid">
      <label>Início<input required type="date" value={data.startDate} disabled={lockedByCourse} onChange={(event) => setData((current) => ({ ...current, startDate: event.target.value }))} /></label>
      <label>Término<input required type="date" value={data.endDate} disabled={lockedByCourse} onChange={(event) => setData((current) => ({ ...current, endDate: event.target.value }))} /></label>
      <label>Turno<select required value={data.shift} disabled={lockedByCourse} onChange={selectShift}><option value="MATUTINO">MATUTINO</option><option value="VESPERTINO">VESPERTINO</option><option value="NOTURNO">NOTURNO</option></select></label>
      <label>Início do horário<input required type="time" value={data.startTime} disabled={lockedByCourse} onChange={(event) => setData((current) => ({ ...current, startTime: event.target.value }))} /></label>
      <label>Fim do horário<input required type="time" value={data.endTime} disabled={lockedByCourse} onChange={(event) => setData((current) => ({ ...current, endTime: event.target.value }))} /></label>
    </div>
    <fieldset><legend>Dias de execução{lockedByCourse && <span className="form-hint"> (definidos pela turma)</span>}</legend><div className="day-picker">{WEEKDAYS.map((day) => <button type="button" key={day} disabled={lockedByCourse} className={data.weekdays.includes(day) ? "selected" : ""} onClick={() => setData((current) => ({ ...current, weekdays: current.weekdays.includes(day) ? current.weekdays.filter((value) => value !== day) : [...current.weekdays, day] }))}>{day}</button>)}</div></fieldset>
    <label>Observações<textarea value={data.notes} onChange={(event) => setData((current) => ({ ...current, notes: event.target.value.toLocaleUpperCase("pt-BR") }))} rows="3" /></label>
    <div className="form-actions"><button type="submit" className="primary">{initialData ? "Salvar alterações" : "Salvar alocação"}</button></div>
  </form>;
}