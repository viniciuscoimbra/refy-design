import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DecisionDeck, type DecisionDeckItem } from './SwipeDeck';
import { sampleContent, sampleArtwork } from '../../_demo/content';
const items: DecisionDeckItem[] = [
 {id:'a',...sampleContent},
 {id:'b',...sampleContent,title:'Interface references',subtitle:'Design collection · updated yesterday',media:[{src:sampleArtwork('#cbd4e4'),alt:'Interface references preview'}]},
 {id:'c',...sampleContent,title:'File organization',subtitle:'Team collection · version 2',media:[{src:sampleArtwork('#e5d5bd'),alt:'File organization preview'}]},
];
const meta = {id:'components-organisms-swipedeck',title:'Components/Organisms/DecisionDeck',component:DecisionDeck,tags:['autodocs'],args:{items},parameters:{docs:{description:{component:'Content review queue. Buttons are the main path; left discards, right selects. Save collapses the card into its own button. Click and gesture give the same visual response. The consumer decides the effect of each action.'}}}} satisfies Meta<typeof DecisionDeck>;
export default meta;
type Story=StoryObj<typeof DecisionDeck>;
export const Gesto:Story={ name: "Gesture",args:{gestureEnabled:true},render:(args)=>{
 const [event,setEvent]=useState('No decision recorded.');
 return <div><DecisionDeck {...args} onAction={(action,item)=>setEvent(`Event: ${action} · ${item.title}`)} onReset={()=>setEvent('Queue restarted.')} /><p role="status">{event}</p></div>;
}};
export const Teclado:Story={ name: "Keyboard",args:{gestureEnabled:true}};
export const MovimentoReduzido:Story={ name: "Reduced motion",args:{motion:'reduced'}};
export const FimDaFila:Story={ name: "End of queue",render:()=>{const[index,setIndex]=useState(items.length);return <DecisionDeck items={items} index={index} onReset={()=>setIndex(0)}/>;}};
