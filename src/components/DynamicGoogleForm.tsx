"use client";

import React, { useState, useEffect } from "react";
import { FormQuestionItem } from "@/app/admin/dashboard/page";

interface DynamicGoogleFormProps {
  formKey: "pencairan" | "pelaporan" | "monev";
  defaultQuestions: FormQuestionItem[];
  formTitle: string;
  formSubtitle: string;
  initialValues?: { [questionId: string]: any };
  onSubmit: (answers: { [qId: string]: any }, answersByTitle: { [title: string]: any }) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export default function DynamicGoogleForm({
  formKey,
  defaultQuestions,
  formTitle,
  formSubtitle,
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Kirim Responses Formulir KIP-K",
}: DynamicGoogleFormProps) {
  const [questions, setQuestions] = useState<FormQuestionItem[]>(defaultQuestions);
  const [answers, setAnswers] = useState<{ [qId: string]: any }>(initialValues);

  // Load questions from semadiksi_custom_forms and sync with Admin Builder
  const loadQuestions = () => {
    try {
      const stored = localStorage.getItem("semadiksi_custom_forms");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed[formKey]) && parsed[formKey].length > 0) {
          setQuestions(parsed[formKey]);
          return;
        }
      }
    } catch (e) {}
    setQuestions(defaultQuestions);
  };

  useEffect(() => {
    loadQuestions();

    // Event listener for live storage updates when Admin saves form
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "semadiksi_custom_forms") {
        loadQuestions();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [formKey]);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setAnswers((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleInputChange = (qId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxToggle = (qId: string, option: string) => {
    const currentList: string[] = Array.isArray(answers[qId]) ? answers[qId] : [];
    if (currentList.includes(option)) {
      setAnswers((prev) => ({ ...prev, [qId]: currentList.filter((o) => o !== option) }));
    } else {
      setAnswers((prev) => ({ ...prev, [qId]: [...currentList, option] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          alert(`Pertanyaan wajib diisi: "${q.title}"`);
          return;
        }
      }
    }

    // Map answers by question title for clean processing
    const answersByTitle: { [title: string]: any } = {};
    questions.forEach((q) => {
      answersByTitle[q.title] = answers[q.id] || "-";
    });

    onSubmit(answers, answersByTitle);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Google Forms Purple Stripe Header Card */}
      <div className="bg-surface border-t-8 border-t-purple-800 border-x border-b border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">assignment</span>
            <span>Formulir Resmi KIP-K UNUSA</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-on-surface tracking-tight">{formTitle}</h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">{formSubtitle}</p>
        </div>

        <div className="pt-3 flex flex-wrap justify-between items-center text-xs border-t border-surface-variant/20 text-on-surface-variant font-medium">
          <span className="flex items-center gap-1.5 text-purple-900 font-bold">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>Tersinkronisasi Otomatis dengan Sistem Kemahasiswaan Admin</span>
          </span>
          <span className="text-error font-bold">* Wajib Diisi</span>
        </div>
      </div>

      {/* QUESTION CARDS LIST */}
      {questions.map((q, idx) => {
        const val = answers[q.id] || "";

        return (
          <div
            key={q.id}
            className="bg-surface border border-surface-variant/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 border-l-4 border-l-purple-700"
          >
            <label className="font-bold text-on-surface text-sm md:text-base block leading-snug">
              {idx + 1}. {q.title} {q.required && <span className="text-error font-bold ml-1">*</span>}
            </label>

            {/* Jawaban Singkat */}
            {q.type === "Jawaban singkat" && (
              <input
                type="text"
                value={val}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder={q.placeholder || "Jawaban Anda..."}
                className="w-full md:w-3/4 px-4 py-3 bg-surface-container-low border border-surface-variant/40 rounded-2xl text-xs md:text-sm text-on-surface font-medium focus:outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-700/20 transition-all"
              />
            )}

            {/* Paragraf */}
            {q.type === "Paragraf" && (
              <textarea
                rows={3}
                value={val}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder={q.placeholder || "Jawaban panjang Anda..."}
                className="w-full px-4 py-3 bg-surface-container-low border border-surface-variant/40 rounded-2xl text-xs md:text-sm text-on-surface font-medium focus:outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-700/20 transition-all"
              />
            )}

            {/* Pilihan Ganda (Radio) */}
            {q.type === "Pilihan ganda" && (
              <div className="space-y-2 pt-1">
                {q.options?.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-xs md:text-sm font-semibold ${
                      val === opt
                        ? "bg-purple-50/70 border-purple-400 text-purple-900 shadow-xs"
                        : "bg-surface-container-low border-surface-variant/20 text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={val === opt}
                      onChange={() => handleInputChange(q.id, opt)}
                      className="w-4 h-4 accent-purple-800 cursor-pointer"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Kotak Centang (Checkboxes) */}
            {q.type === "Kotak Centang" && (
              <div className="space-y-2 pt-1">
                {q.options?.map((opt, oIdx) => {
                  const isChecked = Array.isArray(val) && val.includes(opt);

                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-xs md:text-sm font-semibold ${
                        isChecked
                          ? "bg-purple-50/70 border-purple-400 text-purple-900 shadow-xs"
                          : "bg-surface-container-low border-surface-variant/20 text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(q.id, opt)}
                        className="w-4 h-4 rounded-xs border-purple-300 accent-purple-800 cursor-pointer"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Drop-down */}
            {q.type === "Drop-down" && (
              <select
                value={val}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                className="w-full md:w-3/4 px-4 py-3 bg-surface-container-low border border-surface-variant/40 rounded-2xl text-xs md:text-sm font-bold text-purple-900 focus:outline-none focus:border-purple-700 cursor-pointer"
              >
                <option value="">-- Pilih Salah Satu Opsi --</option>
                {q.options?.map((opt, oIdx) => (
                  <option key={oIdx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* Upload File */}
            {q.type === "Upload file" && (
              <div className="space-y-2 bg-surface-container-lowest p-4 rounded-2xl border border-dashed border-purple-300">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-2xl">cloud_upload</span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Unggah Berkas File Dokumen</p>
                      <p className="text-[10px] text-on-surface-variant">Format PDF/Gambar atau masukkan Tautan Google Drive</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Tempel Tautan Google Drive..."
                    className="w-full sm:w-72 px-3 py-2 bg-surface border border-surface-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-purple-700"
                  />
                </div>

                {val && val.startsWith("http") && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <a href={val} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
                      Tautan file terverifikasi: {val}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tanggal */}
            {q.type === "Tanggal" && (
              <input
                type="date"
                value={val}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                className="px-4 py-2.5 bg-surface-container-low border border-surface-variant/40 rounded-2xl text-xs md:text-sm font-semibold text-on-surface focus:outline-none focus:border-purple-700 cursor-pointer"
              />
            )}

            {/* Skala linier */}
            {q.type === "Skala linier" && (
              <div className="flex items-center gap-4 py-2 overflow-x-auto">
                <span className="text-xs font-bold text-on-surface-variant">1 (Buruk)</span>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleInputChange(q.id, String(n))}
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        String(val) === String(n)
                          ? "bg-purple-800 text-white shadow-md scale-110"
                          : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-on-surface-variant">5 (Sangat Baik)</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Button Bar */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3.5 bg-purple-800 hover:bg-purple-900 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              <span>Mengirimkan Responses...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">send</span>
              <span>{submitButtonText}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
