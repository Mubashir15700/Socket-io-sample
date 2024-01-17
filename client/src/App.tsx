import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

// Define a type for messages
interface Message {
  userId: string | null;
  message: string | null;
}

function App() {
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { userId: null, message: null },
  ]);
  const [toRoom, setToRoom] = useState(false);

  function generateRandomString(purpose = "user id"): any {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i: number = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    if (purpose === "user id") {
      setUserId(result);
    } else {
      setRoomId(result);
    }
  }

  useEffect(() => {
    // Check if userId is not already generated
    if (!userId) {
      generateRandomString();
    }
  }, [userId]);

  const changeMessageTo = () => {
    setToRoom(!toRoom);
  };

  const sendMessage = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { userId, message: messageInput },
    ]);

    if (toRoom) {
      socket.emit("send_room_message", {
        userId,
        message: messageInput,
        room: roomIdInput,
      });
    } else {
      socket.emit("send_message", { userId, message: messageInput });
    }
  };

  const joinRoom = () => {
    if (roomIdInput !== "") {
      socket.emit("join_room", roomIdInput);
    }
  };

  useEffect(() => {
    socket.on("send_response", (data: Message) => {
      console.log("response: ", data);

      setMessages((prevResponse) => [
        ...prevResponse,
        { userId: data.userId, message: data.message },
      ]);
    });
  }, [socket]);

  return (
    <div className="App">
      <p>User{userId}</p>
      <div className="message-div" style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Message"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button onClick={sendMessage} disabled={messageInput ? false : true}>
          Send message
        </button>
        <button onClick={changeMessageTo}>
          Message to {toRoom ? "broadcast" : "room"}
        </button>
      </div>
      <div className="room-div">
        <input
          type="text"
          placeholder="Room Id"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />
        <button onClick={joinRoom} disabled={roomIdInput ? false : true}>
          Join Room
        </button>
        <div>
          <input type="text" placeholder="Room Id" value={roomId} disabled />
          <button onClick={() => generateRandomString("room id")}>
            Generate room id
          </button>
        </div>
      </div>
      {messages?.map(
        (message, index) =>
          message.userId &&
          message.message && (
            <div className="message-div" key={index}>
              <p style={{ color: userId === message.userId ? "red" : "blue" }}>
                From: {message.userId}, message: {message.message}
              </p>
            </div>
          )
      )}
    </div>
  );
}

export default App;
