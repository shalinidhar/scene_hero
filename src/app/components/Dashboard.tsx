"use client";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import NewProjectModal from "./NewProjectModal";
import {socket} from "../../../lib/socket"

export default function Dashboard ({projects}){ 
    //const [projects, modifyProjects] = useState([{id:0, name: "first"}, {id:1, name:"second"}]); 
    const [modalOpen, toggleModal] = useState (false)
    const [temp, setTempProject] = useState("")
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    
    useEffect(() => {  
        if (!socket.connected){
            socket.connect()
        } else{
            onConnect() //setting the states 
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
        
            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }
    
        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }
        

    
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
    
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
     }, []);

    const handleNewProject=()=>{
        //open modal
        toggleModal(true) 
        console.log("open")
    }


    return (
        <>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        {modalOpen && <NewProjectModal onClose={() => toggleModal(false)} projects={projects}/>}
        {projects.map((project)=>(
        <Link key = {project.id} href={`/screenplay/${project.id}`} 
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >{project.title} </Link>
        ))
        }
        <button 
        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        onClick={handleNewProject}>CREATE NEW</button>
        </>
    )
}