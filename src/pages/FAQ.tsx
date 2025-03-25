import { useState } from "react";
import Footer from "@/components/Footer";
import { BsVolumeUp } from "react-icons/bs";
import { Button } from "react-bootstrap";


const FAQ = () => {
  const faqs = [
    { question: "¿Cómo funciona el sistema de ambulancias?", answer: "" },
    { question: "¿Cómo puedo solicitar asistencia?", answer: "El sistema de ambulancias funciona a través de una red de vehículos y personal médico que responden a llamadas de emergencia. Al recibir una llamada, se evalúa la gravedad de la situación y se envía la ambulancia adecuada al lugar. Durante el traslado, el personal médico proporciona atención y soporte vital al paciente hasta llegar al hospital." },
    { question: "¿Qué hacer en caso de emergencia?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." },
    { question: "¿Cómo contactar con soporte técnico?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi." }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const utterance = new SpeechSynthesisUtterance();

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleGoBack = () => {
    window.location.href = "/";
  };

  const toggleSpeech = (text: string, index: number) => {
    if (speakingIndex === index) {
      speechSynthesis.cancel();
      setSpeakingIndex(null);
    } else {
      speechSynthesis.cancel(); 
      utterance.text = text;
      utterance.lang = "es-ES";
      speechSynthesis.speak(utterance);
      setSpeakingIndex(index);
    }
  };


  utterance.onend = () => setSpeakingIndex(null);
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
              <div className="flex justify-between items-center">
                <button 
                  className="w-full text-left font-semibold text-red-700 flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-start"> 
                    {faq.question}
                    <div className="ml-3"> 
                      <Button 
                        variant={speakingIndex === index ? "danger" : "outline-secondary"} 
                        onClick={() => toggleSpeech(faq.question, index)}
                      >
                        <BsVolumeUp />
                      </Button>
                    </div>
                  </div>
                  <span className="text-red-500">{openIndex === index ? "▲" : "▼"}</span>
                </button>
              </div>
              {openIndex === index && (
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-gray-700 text-justify">{faq.answer}</p>
                  <div className="ml-4 flex justify-between items-center"> 
                    <Button 
                      variant={speakingIndex === index + faqs.length ? "danger" : "outline-secondary"} 
                      onClick={() => toggleSpeech(faq.answer, index + faqs.length)}
                    >
                      <BsVolumeUp />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
