import { useState } from "react";
import Footer from "@/components/Footer";
import { BsVolumeUp } from "react-icons/bs";
import { Button } from "react-bootstrap";


const FAQ = () => {
  const faqs = [
    {
      question: "¿Cómo funciona el sistema de ambulancias?",
      answer:
        "El sistema de ambulancias opera mediante la integración de diversas APIs de geolocalización que permiten identificar la ubicación del accidente en tiempo real. Con esta información, se calcula la ruta más eficiente para que la ambulancia llegue lo más rápido posible al lugar de la emergencia. Luego, una vez que el paciente ha sido estabilizado, el sistema genera una nueva ruta hacia el hospital más cercano, optimizando tiempos de respuesta y asegurando una atención médica más oportuna y eficaz.",
    },
    {
      question: "¿Cuál es el fin del proyecto?",
      answer:
        "El principal objetivo del proyecto es ofrecer una alternativa tecnológica que combata la problemática conocida como la 'guerra del centavo' entre ambulancias, en la cual múltiples vehículos compiten por atender una misma emergencia. Nuestro sistema busca garantizar que solo una ambulancia sea asignada a cada accidente, eliminando la duplicidad de esfuerzos, mejorando la organización de la atención prehospitalaria y priorizando la seguridad del paciente y del personal médico.",
    },
    {
      question: "¿Para quiénes está dirigido?",
      answer:
        "El sistema está diseñado especialmente para empresas prestadoras del servicio de ambulancia y su personal operativo. Está conformado por dos perfiles principales: los administradores, encargados de recibir reportes de accidentes, evaluar la severidad del incidente y asignar la ambulancia correspondiente; y los paramédicos, quienes a través de una interfaz interactiva reciben las alertas, visualizan la ruta a seguir y reportan el estado del servicio en tiempo real. Esta plataforma busca facilitar la coordinación interna y optimizar la respuesta ante emergencias.",
    },
    {
      question: "¿Quiénes somos?",
      answer:
        "Somos un equipo de estudiantes de la Universidad del Valle que desarrolla este sistema como parte de nuestro trabajo de grado. Nuestro objetivo es proponer una solución tecnológica innovadora que contribuya a mejorar la atención prehospitalaria en la ciudad de Cali. Cada integrante del equipo aporta desde su experiencia y conocimientos en desarrollo de software, con el compromiso de crear una herramienta funcional, eficiente y que responda a una problemática real que afecta tanto a la comunidad como al sistema de salud local.",
    }

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
