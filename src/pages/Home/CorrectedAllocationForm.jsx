import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api.js";

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const validDateRange = (start, end) => Boolean(start && end && start <= end);
const validTimeRange = (start, end) => Boolean(start && end && start < end);
const formatTime = (value) => String(value || "").slice(0, 5);
const displayName = (value) => String(value || "").trim().toLocaleUpperCase("pt-BR");

export default function CorrectedAllocationForm({ courses, rooms, initialCourse, date, buildingId, onSave }) {
  const [data, setData] = useState({
    courseId: initialCourse?.id || "",
    instructorId: initialCourse?.teacher?.id || "",
    classroomId: "",
    title: initialCourse ? `${initialCourse.code} · ${initialCourse.name}` : "",
    kind: initialCourse ? "TURMA" : "RESERVA",
    startDate: initialCourse?.startDate || date,
    endDate: initialCourse?.endDate || date,
    startTime: formatTime(initialCourse?.startTime) || "08:00",
    endTime: formatTime(initialCourse?.endTime) || "12:00",
    weekdays: initialCourse?.weekdays || ["SEG", "TER", "QUA", "QUI", "SEX"],
    notes: "",
  });
  const [roomResult, setRoomResult] = useState({ rooms: [], totalActiveRooms: 0 });
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const selectedCourse = courses.find((course) => course.id === Number(data.courseId));
  const roomBuildingId = selectedCourse?.building?.id || buildingId;
  const availableCourses = useMemo(
    () => courses.filter((course) => !course.occupancies?.some((occupancy) => occupancy.status !== "CANCELADA")),
    [courses],
  );
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
        const instructorQuery = new URLSearchParams({
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          weekdays: data.weekdays.join(","),
        });
        const [roomPayload, instructors] = await Promise.all([
          api(`/api/classrooms/availability?${roomQuery}`),
          api(`/api/teachers/availability?${instructorQuery}`),
        ]);
        if (cancelled) return;
        const queriedRooms = Array.isArray(roomPayload) ? roomPayload : roomPayload.rooms || [];
        setRoomResult({ rooms: queriedRooms.filter((room) => room.available), totalActiveRooms: roomPayload.meta?.totalActiveRooms ?? queriedRooms.length });
        setAvailableInstructors(instructors);
        const linkedTeacherId = selectedCourse?.teacher?.id;
        if (data.instructorId && !instructors.some((instructor) => instructor.id === Number(data.instructorId)) && !linkedTeacherId) {
          setData((current) => ({ ...current, instructorId: "" }));
        }
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
  }, [data.startDate, data.endDate, data.startTime, data.endTime, data.weekdays, data.courseId, roomBuildingId, selectedCourse?.teacher?.id]);

  function selectCourse(event) {
    const course = courses.find((item) => item.id === Number(event.target.value));
    setData((current) => ({
      ...current,
      courseId: event.target.value,
      instructorId: course?.teacher?.id || "",
      classroomId: "",
      title: course ? `${course.code} · ${course.name}` : current.title,
      startDate: course?.startDate || current.startDate,
      endDate: course?.endDate || current.endDate,
      startTime: formatTime(course?.startTime) || current.startTime,
      endTime: formatTime(course?.endTime) || current.endTime,
      weekdays: course?.weekdays?.length ? course.weekdays : current.weekdays,
      kind: course ? "TURMA" : "RESERVA",
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!data.classroomId) return setError("Selecione uma sala disponível.");
    if (!validDateRange(data.startDate, data.endDate) || !validTimeRange(data.startTime, data.endTime)) return setError("Período ou horário inválido.");
    if (!data.weekdays.length) return setError("Selecione pelo menos um dia de execução.");
    if (selectedCourse && !data.instructorId) return setError("Selecione um instrutor disponível para a turma.");
    setError("");
    onSave(data);
  }

  const noRoomsMessage = error
    ? error
    : roomResult.totalActiveRooms === 0
      ? "Não há salas ativas cadastradas para a unidade desta turma."
      : "As salas ativas desta unidade têm conflito real com o período, horário ou dias selecionados.";

  return <form className="entity-form" onSubmit={submit} noValidate>
    {error && <div className="form-error" role="alert">{error}</div>}
    <label>Turma (opcional)
      <select value={data.courseId} onChange={selectCourse}>
        <option value="">Reserva ou bloqueio avulso</option>
        {(initialCourse && !availableCourses.some((course) => course.id === initialCourse.id) ? [initialCourse, ...availableCourses] : availableCourses).map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}
      </select>
    </label>
    <label>Instrutor
      <select value={data.instructorId} onChange={(event) => setData((current) => ({ ...current, instructorId: event.target.value }))} disabled={checking}>
        <option value="">{checking ? "Consultando instrutores..." : availableInstructors.length ? "Selecione o instrutor disponível" : "Nenhum instrutor ativo disponível neste horário"}</option>
        {availableInstructors.map((instructor) => <option value={instructor.id} key={instructor.id}>{displayName(instructor.name)}{instructor.segment ? ` · ${instructor.segment}` : ""}</option>)}
      </select>
    </label>
    <label>Sala
      <select required value={data.classroomId} onChange={(event) => setData((current) => ({ ...current, classroomId: event.target.value }))} disabled={checking}>
        <option value="">{checking ? "Consultando salas..." : roomResult.rooms.length ? "Selecione a sala disponível" : "Nenhuma sala disponível"}</option>
        {roomResult.rooms.map((room) => <option value={room.id} key={room.id}>{room.building?.name} · {room.name} ({room.capacity})</option>)}
      </select>
    </label>
    {!checking && !roomResult.rooms.length && <p className="form-hint availability-empty">{noRoomsMessage}</p>}
    {!checking && !availableInstructors.length && !error && <p className="form-hint availability-empty">Não há instrutores ativos disponíveis para o período, horário e dias selecionados.</p>}
    <label>Título<input required value={data.title} onChange={(event) => setData((current) => ({ ...current, title: event.target.value }))} /></label>
    <div className="form-grid">
      <label>Início<input required type="date" value={data.startDate} onChange={(event) => setData((current) => ({ ...current, startDate: event.target.value }))} /></label>
      <label>Término<input required type="date" value={data.endDate} onChange={(event) => setData((current) => ({ ...current, endDate: event.target.value }))} /></label>
      <label>Das<input required type="time" value={data.startTime} onChange={(event) => setData((current) => ({ ...current, startTime: event.target.value }))} /></label>
      <label>Até<input required type="time" value={data.endTime} onChange={(event) => setData((current) => ({ ...current, endTime: event.target.value }))} /></label>
    </div>
    <fieldset><legend>Dias de execução</legend><div className="day-picker">{WEEKDAYS.map((day) => <button type="button" key={day} className={data.weekdays.includes(day) ? "selected" : ""} onClick={() => setData((current) => ({ ...current, weekdays: current.weekdays.includes(day) ? current.weekdays.filter((value) => value !== day) : [...current.weekdays, day] }))}>{day}</button>)}</div></fieldset>
    <label>Observações<textarea value={data.notes} onChange={(event) => setData((current) => ({ ...current, notes: event.target.value }))} rows="3" /></label>
    <div className="form-actions"><button type="submit" className="primary">Salvar alocação</button></div>
  </form>;
}
