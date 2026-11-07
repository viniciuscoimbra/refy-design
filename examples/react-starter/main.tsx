import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AvatarGroup, BrandLogo, Button, Card, Combobox, Input, Modal, Segmented, ThemeProvider } from '@refy-design/web';
import type { RefyTheme, ThemeMode } from '@refy-design/web';
import '@refy-design/web/tokens.css';
import '@refy-design/web/global.css';
import '@refy-design/web/fonts.css';
import themeData from './theme.json';
import './app.css';
const theme: RefyTheme = themeData;
function App() {
  const [mode,setMode] = useState<ThemeMode>('light'), [open,setOpen] = useState(false), [project,setProject] = useState(''), [owner,setOwner] = useState('Ana Lima');
  return <ThemeProvider theme={theme} mode={mode} className="app" data-testid="consumer">
    <header className="header"><BrandLogo /><Segmented label="Mode" value={mode} onChange={value => setMode(value as ThemeMode)} options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'},{value:'system',label:'System'}]} /></header>
    <main className="content"><div><p className="eyebrow">Your first project</p><h1>One interface, your theme.</h1><p>Package installed from the local tarball. Fonts, shapes and colors come from theme.json, exported by the Playground.</p></div>
    <Card><div className="stack"><Input label="Project name" value={project} onChange={event => setProject(event.target.value)} block /><Combobox label="Owner" value={owner} options={['Ana Lima','Bruno Reis','Clara Dias'].map(label => ({value:label,label}))} onChange={option => { if(option) setOwner(option.label); }} /><AvatarGroup items={[{name:owner},{name:'Example Team'}]} /><Button variant="primary" onClick={() => setOpen(true)}>Review project</Button><p role="status">{project || 'New project'} · {owner}</p></div></Card>
    </main><Modal open={open} onClose={() => setOpen(false)} title="Review project"><div className="stack"><p>{project || 'New project'} will be followed by {owner}.</p><Combobox label="Reviewer" options={['Ana Lima','Bruno Reis','Clara Dias'].map(label=>({value:label,label}))} /><Button onClick={() => setOpen(false)}>Keep editing</Button></div></Modal>
  </ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
