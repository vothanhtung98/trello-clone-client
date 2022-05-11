import React from 'react'
import './App.scss'
import AppBar from 'components/AppBar/AppBar'
import BoardContent from 'components/BoardContent/BoardContent'

function App() {
    return (
        <div className="trello-clone-container">
            <AppBar />
            <BoardContent />
        </div>
    )
}

export default App
