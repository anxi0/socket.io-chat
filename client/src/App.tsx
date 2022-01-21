import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "./App.css";
import { chatData, joinData } from "./types";
import config from "./config.json";
import io, { Socket } from "socket.io-client";

const StatusBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  background-color: #121212;
`;
const EnterBox = styled.div`
  background-color: #2f74c1;
  color: white;
  border: none;
  border-radius: 100%;
  height: 350px;
  width: 350px;
  padding: 60px;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  animation: dungdung 1.5s infinite alternate;
  justify-content: center;
  h1 {
    font-size: 1.2em;
    font-weight: 500;
    margin-bottom: 20px;
  }
  input {
    padding: 10px;
    border: none;
    &:focus-visible {
      outline: none;
    }
  }
  button {
    width: 100%;
    border: none;
    padding: 10px;
    background: #444853;
    color: #fff;
    cursor: pointer;
    span {
      font-weight: bold;
    }
    .txtE {
      font-size: 1.5em;
    }
    &:hover {
      background: #f1ab14;
      color: #fff;
      .txtMart {
        color: #fff;
      }
      .txtE {
        font-size: 1.5em;
        color: #444853;
      }
    }
  }
  @keyframes dungdung {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, 30px);
    }
  }
`;
const RoomBox = styled.div`
  /* margin: 10px 5px 0; */
  border-bottom: 1px solid #666;
`;
const UserBox = styled.div`
  /* margin: 10px 5px 10px; */
`;
let socket: Socket;
const App = () => {
  const [isEntered, setIsEntered] = useState<boolean>();
  const [nickname, setNickname] = useState<string>("");
  const [roomcode, setRoomcode] = useState<string>("default");
  const [message, setMessage] = useState<string>("");
  const [users, setUsers] = useState<number>(0);

  const [chatList, setChatList] = useState<chatData[]>([]);
  const ulRef = useRef<HTMLUListElement>(null);

  const scrollDown = () => {
    ulRef.current!.scrollTop = ulRef.current!.scrollHeight;
  };
  useEffect(() => {
    socket = io(config.backend);
  }, [config.backend]);
  useEffect(() => {
    socket.on("synchronize", (chats: chatData[]) => {
      // console.log("sync twice");
      // console.log(`SYNC : ${chatList} ${chats}`);
      setChatList((previous) => [...previous, ...chats]);
      scrollDown();
    });
    socket.on("users", (counts: number) => {
      setUsers(counts);
    });
  }, []);
  useEffect(() => {
    socket.on("getChat", (chat: chatData) => {
      // console.log(chat);
      // console.log(chatList);
      // console.log(`GETTING : ${chatList} ${chat.chat}`);
      setChatList((previous) => [...previous, chat]);
      scrollDown();
    });
  }, []);
  const onInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      if (message !== "") {
        // console.log(`sending`);
        // console.log(e.target.value);
        socket.emit("chat", {
          user: nickname,
          chat: message,
          timestamp: new Date().toISOString().split(".")[0].replace("T", " "),
        });
        setMessage("");
        setChatList([
          ...chatList,
          {
            user: nickname,
            chat: message,
            timestamp: new Date().toISOString().split(".")[0].replace("T", " "),
          },
        ]);
        setTimeout(scrollDown, 100);
      }
    }
  };
  return (
    <>
      {isEntered ? (
        <div className="App">
          <section>
            <h1>Sangsoo chat</h1>
            <StatusBox>
              <p>{nickname}</p>
              <p>{roomcode}</p>
              <p>{`현재 인원수 : ${users}명`}</p>
            </StatusBox>
            <ul ref={ulRef}>
              {chatList.map((cur: chatData, idx) => (
                <li key={idx}>
                  <div className="leftBox">
                    <p className="id">{cur.user}</p>
                    <p className="chatVal">{cur.chat}</p>
                  </div>
                  <div className="rightBox">
                    <p className="time">{cur.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="inputBox">
              <input
                value={message}
                onChange={(e) => {
                  e.preventDefault();
                  setMessage(e.target.value);
                }}
                onKeyPress={onInputKeyPress}
              />
              <button>전송</button>
            </div>
          </section>
        </div>
      ) : (
        <Wrapper>
          <EnterBox>
            <h1>Welcome to Sangsoo chat</h1>
            <RoomBox>
              <input
                placeholder="Room C0D3"
                value={roomcode}
                onChange={(e) => {
                  setRoomcode(e.target.value);
                }}
              />
            </RoomBox>
            <UserBox>
              <input
                placeholder="User N4M3"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
              />
            </UserBox>
            <button
              onClick={() => {
                if (roomcode !== "") {
                  if (nickname !== "") {
                    setRoomcode(roomcode);
                    setNickname(nickname);
                    let joinData: joinData = {
                      user: nickname,
                      room: roomcode,
                    };
                    socket.emit("join", joinData);
                    setIsEntered(true);
                  } else {
                    console.log("write name");
                  }
                } else {
                  console.log("write room");
                }
              }}
            >
              영도 <span className="txtE">e</span>
              <span className="txtMart">mart</span> 앞에 지나가기
            </button>
          </EnterBox>
        </Wrapper>
      )}
    </>
  );
};

export default App;
