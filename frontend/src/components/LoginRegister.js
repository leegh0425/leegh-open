import React, { useState } from "react";
import './LoginRegister.css';
import oda_logo from '../images/oda_logo_white.png';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiNaver } from "react-icons/si";


const topics = [
    {
        id: "https://www.naver.com/",
        title: "Naver",
        icon: <SiNaver size={24} color="#03c75a" />
    },
    {
        id: "https://www.instagram.com/",
        title: "Instagram",
        icon: <FaInstagram size={24} color="#E4405F" />
    },
    {
        id: "https://www.youtube.com/",
        title: "Youtube",
        icon: <FaYoutube size={24} color="#FF0000" />
    }
];

function Nav(props) {
    return (
        <nav>
            <ul style={{ display: 'flex', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
                {props.topics.map(t => (
                    <li key={t.id}>
                        <a href={t.id} target="_blank" rel="noopener noreferrer" title={t.title}>
                            {t.icon}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

const LoginRegister = () => {

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // 3번 단계에서 여기서 API 호출!
        alert(`id: ${id}\nPassword: ${password}`);
    };

    return (
        <div className="wrapper">
            <div className="container" style={{display: "flex", flexDirection: "row"}}>
                <div className="sign-in-container" style={{width: "50%", background: "#f5f6fa", borderRadius: "10px 0 0 10px"}}>
                    <form onSubmit={handleSubmit}> 
                        <h1>oda_Login</h1>
                        <div className="social-links">
                            <Nav topics={topics} />
                        </div>
                        <span>or use your account</span>
                        <input type="id" placeholder="id" value={id} onChange={(e) => setId(e.target.value)}/>
                        <input type="password" placeholder="Password" value={password} 
                               onChange={(e) => setPassword(e.target.value)}/>
                        <button className="form_btn" type="submit">Login In</button>
                    </form>
                </div>
                <div className="overlay-right" style={{
                    width: "50%",
                    background: "#1a1762",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "0 10px 10px 0"
                }}>
                    <img src={oda_logo} alt="오다 로고" style={{ width: 220, marginBottom: 32 }} />
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
