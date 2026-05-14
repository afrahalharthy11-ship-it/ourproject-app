
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello \n How can we help you?",
    },
    {
      sender: "bot",
      text:
        "Type the number:\n" +
        "1. 📅 Book Appointment\n" +
        "2. 📋 My Appointments\n" +
        "3. 🏥 Dashboard\n" +
        "4. ℹ️ About Platform\n" +
        "5. 📞 Contact Us",
    },
  ]);

  const options = [
    { id: 1, response: "Redirecting to book appointment...", link: "/client/book" },
    { id: 2, response: "Here are your appointments.", link: "/client/appointments" },
    { id: 3, response: "Opening dashboard...", link: "/client/dashboard" },
    {
      id: 4,
      response: "A smart healthcare platform for easy appointment booking.",
      link: null,
    },
    {
      id: 5,
      response: "📧 info@healthcare.com\n📞 +1 800 123 456",
      link: null,
    },
  ];

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    const number = parseInt(input.trim(), 10);
    const option = options.find((o) => o.id === number);

    setTimeout(() => {
      if (option) {
        setMessages((prev) => [...prev, { sender: "bot", text: option.response }]);
        if (option.link) {
          setTimeout(() => navigate(option.link), 400);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please choose a valid number (1–5)." },
        ]);
      }
    }, 300);

    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <button className="chatbot-toggle-btn" onClick={toggleChat}>
        ?
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Assistant</h3>
            <button className="chatbot-close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>

          <div className="chatbot-content">
            <div className="chatbot-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chatbot-message ${msg.sender}`}>
                  {msg.text.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              <input
                type="text"
                placeholder="Type a number..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
