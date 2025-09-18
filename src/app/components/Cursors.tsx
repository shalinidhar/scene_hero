// 'use-client'
// import {
//   CursorOverlayData,
//   useRemoteCursorOverlayPositions,
// } from '@slate-yjs/react'
// import { useRef } from 'react'

// export function Cursors({ children }: { children: React.ReactNode }) {
//   const containerRef = useRef(null)
//   const [cursors] = useRemoteCursorOverlayPositions({ containerRef })

//   return (
//     <div className="cursors" ref={containerRef}>
//       {children}
//       {cursors.map(cursor => (
//         <Selection key={cursor.clientId} {...cursor} />
//       ))}
//     </div>
//   )
// }

// interface SelectionProps {
//   data: CursorOverlayData | null;
//   selectionRects: DOMRect[];
//   caretPosition?: React.CSSProperties;
// }

// function Selection({ data, selectionRects, caretPosition }: SelectionProps) {
//   if (!data) {
//     return null
//   }

//   const selectionStyle = {
//     backgroundColor: data.color,
//   }

//   return (
//     <>
//       {selectionRects.map((position, i) => (
//         <div
//           style={{ ...selectionStyle, ...position }}
//           className="selection"
//           key={i}
//         />
//       ))}
//       {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
//     </>
//   )
// }

// interface CaretProps {
//   caretPosition: React.CSSProperties;
//   data: CursorOverlayData;
// }


// function Caret({ caretPosition, data }: CaretProps) {
//   const caretStyle = {
//     ...caretPosition,
//     background: data?.color,
//   }

//   const labelStyle = {
//     transform: 'translateY(-100%)',
//     background: data?.color,
//   }

//   return (
//     <div style={caretStyle} className="caretMarker">
//       <div className="caret" style={labelStyle}>
//         {data?.name}
//       </div>
//     </div>
//   )
// }