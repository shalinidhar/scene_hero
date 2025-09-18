'use client';
import Screenplay from './Editor';
import { RenderElementProps, RenderLeafProps, ReactEditor, Editable } from 'slate-react';
// Import React dependencies.
import React, { useState, useCallback,useRef, useEffect, useMemo, useLayoutEffect } from 'react'
// Import the `Editor` and `Transforms` helpers from Slate.
import { Editor, Transforms, Element, Range } from 'slate'
import Element_Button from './Element Button';
import { update } from 'immutable';
import { HistoryEditor } from 'slate-history';

type Props = {
  renderElement: (props: RenderElementProps) => JSX.Element;
  renderLeaf: (props: RenderLeafProps) => JSX.Element;
  value: Node[];
  setValue: React.Dispatch<React.SetStateAction<Node[]>>
  saveValue: ()=>void;
  editor: Editor
  pages: number
  changePages: React.Dispatch<React.SetStateAction<number>>; 
  addElement: ()=>void; 
};

export default function Paginated_Editor({ renderElement, renderLeaf, value, setValue, saveValue, editor, pages, changePages, addElement}: Props) {
    const lastRef = useRef(null); //ref helps in accessing react components as DOM elements
    const [height, heightLog] = useState(0)
    const pageNumbers = useMemo(() => {
      return Array.from({ length: pages }, (_, i) => i);
    }, [pages]);

    //const [index, updateIndex]=useState(0)

    //track the height 
    useEffect(() => {
      if (!lastRef.current) return;

      const observer = new ResizeObserver(entries => {
        for (let entry of entries){
            console.log(entry.contentRect.height)
            heightLog(entry.contentRect.height);            
        }
      });

      observer.observe(lastRef.current);
    }, [pages.length]);

    //if exceeds 864
    useEffect(()=>{
        console.log(height)
        //case: add a page to the end 
        // (not letting cursor go to a point and inserting dummy node instead)
        //what happens: the moment it IS 864, it skips that line and creates node
        if (height%(864)==0 && height>10){ //add page number to formula
          console.log("enters print statement: ")
            Transforms.insertNodes(
              editor,
              { type: 'action', children: [{ text: '\n\n\n\n\n\n\n\n' }] }, //9 lines added
              {at:[editor.children.length]}
            ) 
            changePages(pages+1)       
            console.log(value.length)
            
                  // Move cursor to the end of inserted node's text
              Transforms.select(editor, {
                  anchor: Editor.end(editor, []),
                  focus: Editor.end(editor, []),
              })
        } 
        //Page count decreases by one 864+27x 216 
        if (height%(864+216)==0 && height>27){
          Transforms.removeNodes(editor)
          Transforms.removeNodes(editor)  //REMOVING THIS NODE AS WELL BECAUSE THIS GETS ADDED (HAVE TO CHANGE LOGIC A BIT)
          console.log("in if statement")
          if (pages>1){
            changePages(pages-1)
          }          
        } 
        //HANDLE ADDING AND REMOVING PAGES
        //HANDLE CONTINUATIONS
      
  

    },[height]);

    const handleInput=(page:number)=>{

    }

    const handleClick =(page: number)=>{
      console.log(page)

    }

    // //track selection  (page and node) and handle useRef
    // useEffect(()=>{
    //     //find the page and node
    //     if (editor.selection){
    //     // console.log(Editor.path(editor, editor.selection));
    //     // console.log("node")
    //     }

    // },[editor.selection])

  return (
    <>
    <div className= 'relative'>

    { pageNumbers.map((page) => (
    
    
    <div key={page}>
    <div className="flex justify-center"> 
        <div className="bg-white w-[816px] h-[1056px] shadow-xl">
        <p>....</p>
        <p>{page+1}</p>
        <p>....</p>


        {/* <div className="font-[Courier] mx-auto max-w-[610px] max-h-[865px] w-full"
        ref={page==(pages.length-1)? lastRef:null}
        contentEditable 
        data-slate-editor
        data-slate-node="element"
        data-slate-object="block"
        suppressContentEditableWarning 
        onInput={() => handleInput(page)} 
        onClick={()=> handleClick(page)}
        onSelect={handleSelect}
        >
        {value.slice(start, end).map((element, index) => {
        return renderElement({
        element,
        attributes: {
        key: index,
        'data-slate-node': 'element',
        },
        children: element.children.map(child => child.text).join('') //loop through and render all children
        });
        })}        
        </div> */}
                   
    </div>
    </div>
    <p>  --- </p>
    </div>
    ))
    }
    <div className="absolute top-0 left-0 z-10 w-full">
          <div className= "relative flex items-start">
          <Editable className="text-[18px] font-[Courier] mx-auto max-w-[610px] w-full"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            ref = {lastRef}
            onKeyDown={ event =>{
              if (event.key =='Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey){
                console.log("Enter")
                event.preventDefault() // ADD A CASE TO CHECK FOR NEW LINE
                addElement()                
              }
              if(!event.ctrlKey){return}
              switch(event.key){                
                case 'b':{
                  event.preventDefault()
                  const marks = Editor.marks(editor)
                  if (marks){
                    if(marks.bold){
                      Editor.removeMark(editor, 'bold')
                      break
                    }
                  }
                  Editor.addMark(editor, 'bold', true)
                  break
                }
                case 'i':{
                  event.preventDefault()
                  const marks = Editor.marks(editor)
                  if (marks){
                    if(marks.italic){
                      Editor.removeMark(editor, 'italic')
                      break
                    }
                  }
                  Editor.addMark(editor, 'italic', true)
                  break
                }
                case 'u':{
                  event.preventDefault()
                  const marks = Editor.marks(editor)
                  if (marks){
                    if(marks.underline){
                      Editor.removeMark(editor, 'underline')
                      break
                    }
                  }
                  Editor.addMark(editor, 'underline', true)
                  break
                }
                case 'z':{
                  console.log("tried to undo")
                  HistoryEditor.undo(editor)
                }
                case 'y':{
                  HistoryEditor.redo(editor)
                }
                case 's':{
                  console.log("save")
                  saveValue()
                }               

              }
            }
            }
          >
          </Editable>
          </div>
    </div>
    </div>

    
  </> 
  )  

    };
