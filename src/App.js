import React from 'react';
import OSPF from './components/OSPFVisualizer';
import './App.css'
import { Learnmore } from './components/ui/learnmore_button';

function App() {
    return (
        <div >
            <h1 className='headingtext '>Open Shortest Path First Protocol Visualizer</h1>
            <Learnmore/>
            <OSPF/>
        </div>
    );
}

export default App;
