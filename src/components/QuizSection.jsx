// =====================================================================
// CUESTIONARIO REUTILIZABLE (estilo Google Forms)
// =====================================================================
// Se usa en DOS lugares con reglas distintas (las controla la prop `isFinal`):
//
//   PRÁCTICO  -> isFinal={false}, field="practicaTest"
//                Intentos ILIMITADOS. No se guarda nota ni se bloquea nada.
//
//   PRUEBA    -> isFinal={true},  field="prueba"   (examen final)
//                UN solo intento. Al enviar, se guarda el resultado con retakeAllowed=false
//                y la prueba queda BLOQUEADA. Solo si el profesor activa el interruptor
//                "Repetir" (Panel > Resultados) el alumno podrá rendirla otra vez.
//                (Los profesores/admin pueden probarla siempre sin que se guarde nada.)
//
// Las preguntas viven en courses/{id}.<field> -> [{ id, text, type, options, correct }]
// =====================================================================
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Lock, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResult } from '../hooks/useFirestore';
import { updateCourse, saveResult } from '../services/db';
import QuestionFormModal, { QUESTION_TYPES } from './QuestionFormModal';
import { PASS_PERCENT, FINAL_EXAM_TIME_LIMIT_MIN } from '../constants';

// Corrige una pregunta. Devuelve true/false, o null si no se corrige (respuesta corta).
// Para cambiar cómo se califica, modifica esta función.
const grade = (q, answer) => {
  if (q.type === 'text') return null;
  if (q.type === 'single') return answer === q.correct[0];
  const picked = (answer || []).slice().sort().join(',');
  return picked === q.correct.slice().sort().join(',');
};

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const QuizSection = ({ course, field, isFinal }) => {
  const { user, isStaff } = useAuth();
  const questions = course[field] || [];

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // { score, total, percent } tras enviar
  const [sending, setSending] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [modal, setModal] = useState(null); // null | {} (nueva) | { question } (editar)

  // Solo el alumno rindiendo la PRUEBA final queda registrado y sujeto al bloqueo.
  const tracked = isFinal && !isStaff;
  const { data: saved, loading: loadingSaved } = useResult(tracked ? user : null, course.id);

  // BLOQUEO: ya rindió la prueba y el profesor NO autorizó repetirla.
  const locked = tracked && !!saved && saved.retakeAllowed !== true && !result;
  // ¿Puede volver a intentar después de ver su resultado?
  // Práctico: siempre. Prueba: solo si el profesor lo autorizó (o es staff probando).
  const canRetry = !isFinal || isStaff || saved?.retakeAllowed === true;

  // ----- Envío y corrección -----
  const submit = async () => {
    if (sending || result) return;
    setSending(true);
    setSaveError(false);
    const graded = questions.filter((q) => q.type !== 'text');
    const score = graded.filter((q) => grade(q, answers[q.id])).length;
    const percent = graded.length ? Math.round((score / graded.length) * 100) : 100;
    setResult({ score, total: graded.length, percent });
    try {
      if (tracked) await saveResult(user, course, score, graded.length, (saved?.attempts || 0) + 1);
    } catch (err) {
      console.error('No se pudo guardar el resultado:', err);
      setSaveError(true);
    }
    setSending(false);
  };
  // Guardamos la versión más reciente de submit para que el temporizador siempre use las respuestas actuales.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  const retry = () => {
    setAnswers({});
    setResult(null);
    setSaveError(false);
    setSecondsLeft(FINAL_EXAM_TIME_LIMIT_MIN * 60); // reinicia el contador del nuevo intento
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  // ----- Temporizador (solo PRUEBA final y solo si FINAL_EXAM_TIME_LIMIT_MIN > 0) -----
  const formVisible = questions.length > 0 && !result && !locked && !(tracked && loadingSaved);
  const timed = tracked && FINAL_EXAM_TIME_LIMIT_MIN > 0 && formVisible;
  const [secondsLeft, setSecondsLeft] = useState(FINAL_EXAM_TIME_LIMIT_MIN * 60);

  // Cuenta regresiva: resta un segundo por segundo mientras el formulario está visible.
  useEffect(() => {
    if (!timed) return undefined;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [timed]);

  // Se acabó el tiempo: se envía automáticamente lo que haya respondido.
  useEffect(() => {
    if (timed && secondsLeft === 0) submitRef.current();
  }, [timed, secondsLeft]);

  // ----- CRUD de preguntas (solo profesor/admin) -----
  const saveQuestions = (next) => updateCourse(course.id, { [field]: next });
  const handleSaveQuestion = (data) => {
    if (modal.question) return saveQuestions(questions.map((q) => (q.id === modal.question.id ? { ...q, ...data } : q)));
    return saveQuestions([...questions, { id: crypto.randomUUID(), ...data }]);
  };
  const handleDeleteQuestion = (q) => {
    if (window.confirm('¿Eliminar esta pregunta?')) saveQuestions(questions.filter((x) => x.id !== q.id));
  };

  // ----- Respuestas del alumno -----
  const setAnswer = (qid, value) => setAnswers({ ...answers, [qid]: value });
  const toggleMulti = (qid, i) => {
    const current = answers[qid] || [];
    setAnswer(qid, current.includes(i) ? current.filter((x) => x !== i) : [...current, i]);
  };
  const highlightCorrect = (q, i) => result && q.type !== 'text' && q.correct.includes(i);

  return (
    <div>
      {/* Resultado recién enviado */}
      {result && (
        <div className={`rounded-lg shadow-sm p-6 mb-4 border-l-4 ${result.percent >= PASS_PERCENT ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
          <h2 className="text-xl font-semibold text-gray-900">
            {result.total ? `Obtuviste ${result.score} de ${result.total} (${result.percent}%)` : 'Respuestas enviadas'}
          </h2>
          {result.total > 0 && (
            <p className="text-sm text-gray-700 mt-1">
              {result.percent >= PASS_PERCENT ? '¡Aprobado! Buen trabajo.' : `Necesitas ${PASS_PERCENT}% para aprobar.`}
            </p>
          )}
          {saveError && <p className="text-sm text-red-600 mt-1">No se pudo guardar tu resultado. Avisa a tu profesor.</p>}
          {canRetry ? (
            <button onClick={retry} className="mt-3 text-sm text-primary font-medium hover:underline">Volver a intentar</button>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Esta prueba solo se rinde una vez. Si necesitas repetirla, tu profesor debe autorizarlo.</p>
          )}
        </div>
      )}

      {/* PRUEBA BLOQUEADA: ya la rindió y el profesor no autorizó un nuevo intento */}
      {locked && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Lock size={20} className="text-gray-500" /> Ya rendiste esta prueba
          </h2>
          <p className="text-gray-700 mt-2">
            Tu resultado: <strong>{saved.score} de {saved.total} ({saved.percent}%)</strong>
            {saved.attempts > 1 && <span className="text-gray-500"> · intento {saved.attempts}</span>}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Para volver a rendirla, tu profesor debe autorizar un nuevo intento.
          </p>
        </div>
      )}

      {tracked && loadingSaved && <p className="text-center text-gray-500 p-6">Cargando...</p>}

      {/* Contador regresivo (solo si se configuró un límite de tiempo) */}
      {timed && (
        <div className={`sticky top-16 z-30 mb-4 flex items-center justify-end gap-2 text-sm font-semibold ${secondsLeft <= 60 ? 'text-red-600' : 'text-primary-dark'}`}>
          <span className="bg-white rounded-full shadow px-4 py-1.5 flex items-center gap-2">
            <Clock size={16} /> Tiempo restante: {formatTime(secondsLeft)}
          </span>
        </div>
      )}

      {/* Botón de preguntas (solo staff) */}
      {isStaff && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={18} /> Agregar pregunta
          </button>
        </div>
      )}

      {questions.length === 0 && !locked ? (
        <p className="text-gray-500 bg-white rounded-lg p-8 text-center shadow-sm">Aún no hay preguntas.</p>
      ) : (
        !locked && !(tracked && loadingSaved) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {questions.map((q, n) => {
              const ok = result ? grade(q, answers[q.id]) : null;
              return (
                <fieldset key={q.id} disabled={!!result} className="bg-white rounded-lg shadow-sm p-6 relative focus-within:border-l-4 focus-within:border-primary">
                  {isStaff && (
                    <div className="absolute top-4 right-4 flex gap-3">
                      <button type="button" onClick={() => setModal({ question: q })} aria-label="Editar pregunta" className="text-primary hover:text-primary-dark"><Pencil size={18} /></button>
                      <button type="button" onClick={() => handleDeleteQuestion(q)} aria-label="Eliminar pregunta" className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  )}

                  <legend className="sr-only">Pregunta {n + 1}</legend>
                  <p className="text-base font-medium text-gray-900 mb-1 pr-16">{n + 1}. {q.text}</p>
                  <p className="text-xs text-gray-400 mb-4">{QUESTION_TYPES[q.type]}</p>

                  {q.type === 'text' ? (
                    <input
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Tu respuesta"
                      className="w-full sm:w-2/3 border-0 border-b border-gray-300 focus:border-primary focus:ring-0 outline-none py-1 bg-transparent"
                    />
                  ) : (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className={`flex items-center gap-3 rounded px-2 py-1.5 cursor-pointer hover:bg-purple-50 ${highlightCorrect(q, i) ? 'bg-green-50' : ''}`}
                        >
                          <input
                            type={q.type === 'single' ? 'radio' : 'checkbox'}
                            name={q.id}
                            className="accent-[#9D508D]"
                            checked={q.type === 'single' ? answers[q.id] === i : (answers[q.id] || []).includes(i)}
                            onChange={() => (q.type === 'single' ? setAnswer(q.id, i) : toggleMulti(q.id, i))}
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {result && ok !== null && (
                    <p className={`flex items-center gap-1.5 text-sm font-medium mt-3 ${ok ? 'text-green-600' : 'text-red-500'}`}>
                      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {ok ? 'Correcta' : 'Incorrecta (las respuestas correctas están resaltadas)'}
                    </p>
                  )}
                </fieldset>
              );
            })}

            {!result && (
              <button
                type="submit"
                disabled={sending}
                onClick={(e) => {
                  // En la prueba final el envío es definitivo: pedimos confirmación.
                  if (tracked && !window.confirm('Solo tienes un intento. ¿Enviar la prueba ahora?')) e.preventDefault();
                }}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            )}
          </form>
        )
      )}

      {modal && (
        <QuestionFormModal question={modal.question} onSave={handleSaveQuestion} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default QuizSection;
