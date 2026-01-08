'use client';
// Import React dependencies.
import React, { useState, useCallback,useRef, useEffect, useMemo } from 'react'
// Import the Slate editor factory.
import { createEditor, insertNode } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, useSlate} from 'slate-react'

//import Slate History plugin 
import { withHistory } from 'slate-history'

// TypeScript users only add this code
import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'

// Import the `Editor` and `Transforms` helpers from Slate.
import { Editor, Transforms, Element, Path, Text} from 'slate'

//Importing custom UI elements 
import Element_Button from './Element Button';
import Paginated_Editor from './Paginated_Editor';
import ScriptPDF from './ScriptPDF';
import { PDFViewer } from '@react-pdf/renderer';
import ReactDOM from 'react-dom/client';
import { Props } from 'next/script';

//import yjs and socket for collaboration 
import * as Y from 'yjs' 
import { WebsocketProvider } from 'y-websocket'
import WebSocket from 'ws';
import { withYjs, YjsEditor } from '@slate-yjs/core'
import {socket} from "../../../lib/socket"

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}
const Toolbar = () => {
  const editor = useSlate()
  return (
    <div>
      <button>B</button>
      <button>I</button>
      {/* <button active={isBoldActive(editor)}>B</button>
      <button active={isItalicActive(editor)}>I</button> */}
    </div>
  )
}

//Enables undo and redo in Slate 
export interface HistoryEditor extends BaseEditor {
  history: History
  undo: () => void //pops from the undos stack, applies it and puts it to redo
  redo: () => void //pops from the redo stack, applies it and puts it to undo
  writeHistory: (stack: 'undos' | 'redos', batch: any) => void
}

type Props = {
  projectId: number
  initialValue: []
  page_count : number
  sharedType: Y.XmlText
  setYjsSynced: React.Dispatch<React.SetStateAction<boolean>>
}

//Screenplay with collaborative editing 
export default function Screenplay({projectId, initialValue, page_count}:Props){
    const [value, setValue] = useState(initialValue)
    const [pages, changePages] = useState(page_count)

    const printRef = useRef(null); //ref helps in accessing react components as DOM elements
    const [showPDF, handlePDF] = useState(false)

    const [connected, setConnected] = useState(false)
    const [sharedType, setSharedType] = useState<Y.XmlText>()
    const [provider, setProvider] = useState<WebsocketProvider>()
    const [yjsSynced, setYjsSynced] = useState(false)
    const [yDoc, setDoc] = useState<Y.Doc>()

    // Connects to Y.js provider and document
    useEffect(() => {
      const doc = new Y.Doc()
      setDoc(doc)
      const sharedDoc = doc.get('slate', Y.XmlText) //get the shared text type of the document
      setSharedType(sharedDoc)
      const yProvider = new WebsocketProvider(
          'ws://localhost:1234', projectId.toString(),
          doc,
        ) 
      yProvider.on('sync', setConnected)
      setProvider(yProvider)
      return () => {
        yDoc?.destroy()
        yProvider?.off('sync', setConnected)
        yProvider?.destroy()
      }
    },[projectId])

    //preparing the editor with yjs plugin and normalisation rules
    const editor = useMemo(() => {
      if (!sharedType && !connected){
        return withReact(withHistory(createEditor()))
      }
    const e = withReact(withHistory(withYjs(createEditor(), sharedType)))

    // method that ensures editor always has at least 1 valid child
    const { normalizeNode } = e
    e.normalizeNode = (entry, options) => {
      const [node] = entry
      if (!Editor.isEditor(node) || node.children.length > 0 || sharedType.length>0) {
        return normalizeNode(entry, options)
      }
      //If this is the first opener of the shared document, only render 
      // original values
      if (sharedType.length===0){
        Transforms.insertNodes(editor, value, { at: [0] })
        return
      }
      return normalizeNode(entry,options)
    }
    return e
    }, [sharedType, connected])

  useEffect(() => { //connect to yjs
    if (!sharedType || !YjsEditor.isYjsEditor(editor)) return;
    YjsEditor.connect(editor)
    setConnected(true)
    return () => YjsEditor.disconnect(editor)
  }, [editor,sharedType])
 
    //function to edit a text block(element)
    const changeValue=()=>{
      let index = 0 //TO DO
      let path = [index]
      Transforms.setNodes(
        editor,
        { type: 'character' }, // TO DO change to whatever user wants
        { at: path }
      );
    };

    //function to save a file (push to database)
    const saveValue =async ()=>{
      console.log(projectId)
      console.log(value)
      const res = await fetch(`http://localhost:3000/api/projects?id=${projectId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",  
        },
        body: JSON.stringify({
        story: value,  // <-- the story (value) that gets updated
        page_count:pages
        }),
      }); 
    }

    //function to add a new element (when Enter is pressed)
    const addElement =()=>{   //INSERT LOCATION DETERMINED BY CURSOR???
      console.log("In add element: ")

      // Get current selection path and find the insert location
      // TO DO: handle edge case: If path is null/not selected
      const currentPath = Editor.path(editor, editor.selection!.focus)
      console.log("cp ", currentPath)
      const insertPath = Path.next(currentPath)
      const newEl = { type: 'character', children: [{ text: 'new' }] }

      // Insert node at the insert path
      Transforms.insertNodes(editor, newEl, { at: [currentPath[0]+1], select: false })
      //Transforms.insertNodes(editor, newEl, { at: [0], select: false })

      // Move cursor to the end of inserted node's text
      Transforms.select(editor, {
        anchor: Editor.end(editor, []),
        focus: Editor.end(editor, []),
      })

    }

    //function to export screenplay to pdf
    const exportToPDF =  () => {
      const newWindow = window.open('', '_blank', 'width=1000,height=800');
      if (!newWindow) return;

      newWindow.document.title = 'Script PDF';
      const container = newWindow.document.createElement('div');
      newWindow.document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(
        <PDFViewer width="100%" height="100%">
          <ScriptPDF value={value} pages={pages} />
        </PDFViewer>
      );
    };


    // Define a rendering function based on the element passed to `props`. \
    // Render entire text blocks
    const renderElement = useCallback(props => {
        switch(props.element.type){
          case 'action':
            return <p className="text-left mx-auto max-w-[610px]"  {...props.attributes}>{props.children}</p>
          case 'character':
            return <p className="uppercase text-center mx-auto max-w-[200px]"  {...props.attributes}>{props.children}</p>         
          case 'parenthetical':
            return <p className="text-center mx-auto max-w-[270px]"  {...props.attributes}>{props.children}</p>
          case 'dialogue':
            return <p className = "text-left mx-auto max-w-[300px]" {...props.attributes}>{props.children}</p>
          case 'transition':
            return <p className = "uppercase text-right mx-auto max-w-[480px]" {...props.attributes}>{props.children}</p>
          case 'heading':
            return <p className="uppercase text-left mx-auto max-w-[610px]"  {...props.attributes}>{props.children}</p>
          case 'buffer':
            return <p {...props.attributes}>{props.children}</p>
          default: 
            return <p {...props.attributes}>{props.children}</p>
        }
        
    }, [])

    // const withVoidElements = editor => {
    //   const { isVoid } = editor
    //   editor.isVoid = element => {
    //     return element.type === 'buffer' ? true : isVoid(element)
    //   }
    //   return editor
    // }

    // Define a leaf rendering function that is memoized with `useCallback`.
    const renderLeaf = useCallback(props => {
      return <Leaf {...props} />
    }, [])

    const Leaf = props => {
      return (
        <span
          {...props.attributes}
          style={{ 
            fontWeight: props.leaf.bold ? 'bold' : 'normal' ,
            fontStyle: props.leaf.italic ? 'italic' : 'normal',
            textDecoration: props.leaf.underline ? 'underline' : 'none'
          }}
        >
          {props.children}
        </span>
      )
    }

    return (
        <div className="min-h-screen bg-rose-200">
            <header>
              <button
              className="left-[100px] bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
              onClick={addElement}>
              +</button>

              <button
              className="left-[300px] bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
              onClick={exportToPDF}>
              EXPORT TO PDF</button>                   
            </header>
 
            <Slate editor={editor} initialValue={value} onChange = {(newValue: any) =>{setValue(newValue); console.log(value)}}>
              <Toolbar></Toolbar>
              <div ref = {printRef} id="pdf">
                <Paginated_Editor
                  renderElement={renderElement} 
                  renderLeaf={renderLeaf} 
                  value={value} 
                  setValue={setValue}                    
                  changeValue={changeValue} 
                  addElement={addElement}
                  saveValue ={saveValue}
                  editor={editor}
                  pages={pages}
                  changePages={changePages}>
                </Paginated_Editor> 
              </div>                                      
            </Slate>          
        </div>
    )
}
