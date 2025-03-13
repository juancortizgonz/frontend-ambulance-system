import { useState } from "react";
import Footer from "@/components/Footer";

const FAQ = () => {
  const faqs = [
    { question: "¿Cómo funciona el sistema de ambulancias?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." },
    { question: "¿Cómo puedo solicitar asistencia?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." },
    { question: "¿Qué hacer en caso de emergencia?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." },
    { question: "¿Cómo contactar con soporte técnico?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleGoBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-100 p-6 flex flex-col items-center">
        {/* Botón de regreso */}
        <button
          onClick={handleGoBack}
          className="self-start mb-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
        >
          ← Regresar
        </button>

        <h1 className="text-4xl font-bold text-red-600 mb-6">Preguntas Frecuentes</h1>
        
        <div className="w-full max-w-2xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <button 
                className="w-full text-left font-semibold text-red-700 flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="text-red-500">{openIndex === index ? "▲" : "▼"}</span>
              </button>
              {openIndex === index && <p className="text-gray-700 mt-2">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
