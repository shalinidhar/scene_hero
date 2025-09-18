'use client';
import Editor from "./Editor";

export default function Element_Button({changeValue}){
    return (
        <button 
        className="absolute left-[50px] bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        onClick={changeValue}>
        E
        </button>
    )
}