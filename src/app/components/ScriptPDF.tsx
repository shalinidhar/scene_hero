'use client';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Courier_Prime } from 'next/font/google';

Font.register({
  family: 'Courier',
  src: 'https://fonts.gstatic.com/s/courierprime/v7/u-4k0rCzjgs5J7oXnJcM_0kACGMt.ttf', // Courier Prime (Free and similar)
});


const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 40,
  },
  section: {
    marginBottom: 10,
    fontSize: 12,
    fontFamily: 'Courier'
  },
  character: {
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Courier'
  },
    parenthetical: {
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Courier'
  },
  
});

const getStyle=(element: any)=>{
  switch(element.type){
    case 'character':
      return styles.character;
    case 'parenthetical':
      return styles.parenthetical;  

    case 'dialogue':
      return styles.parenthetical; 
          
    case 'transition':
      return styles.parenthetical;   
          
    case 'heading':
      return styles.section;
          
    case 'heading':
      return styles.section;
      
    default: 
      return styles.section;
    
  }
}

type Props={
  value: Node[];
  pages: [number, number][];
};

export default function ScriptPDF({ value, pages }: Props) {
  return (
    <Document >
      {pages.map(([start, end], page) => (
        <Page key={page} size="LETTER" style={styles.page} >         
          {value.slice(start, end).map((element, index) => (
            <View key={index}>
              {element.children.map((child: any, i: number) => (
                <Text key={i} style={getStyle(element)}>{child.text}</Text>
              ))}
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}

