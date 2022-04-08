import React, { useState, useEffect, useRef } from 'react'
import { isEmpty } from 'lodash'
import { Container, Draggable } from 'react-smooth-dnd'
import { Container as BootstrapContainer, Row, Col, Form, Button } from 'react-bootstrap'

import './BoardContent.scss'

import Column from 'components/Column/Column'
import { mapOrder } from 'utilities/sorts'
import { applyDrag } from 'utilities/dragDrop'

import { fetchBoardDetails } from 'actions/ApiCall'

function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)
    const [newColumnTitle, setNewColumnTitle] = useState('')
    const onNewColumnTitleChange = (e) => { setNewColumnTitle(e.target.value) }

    useEffect(() => {
        const boardId = '624ee6452281054bcfad4e44'
        fetchBoardDetails(boardId).then(board => {
            setBoard(board)
            // Sort columns according to columns order
            setColumns(mapOrder(board.columns, board.columnOrder, '_id'))
        })
    }, [])

    const newColumnInputRef = useRef(null)


    const addNewColumn = () => {
        if (!newColumnTitle) {
            newColumnInputRef.current.focus()
            return
        }

        const newColumnToAdd = {
            id: Math.random().toString(36).substr(2, 5), // 5 random characters, test data
            boardId: board._id,
            title: newColumnTitle.trim(),
            cardOrder: [],
            cards: []
        }

        let newColumns = [...columns]
        newColumns.push(newColumnToAdd)

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c._id)

        newBoard.columns = newColumns

        setColumns(newColumns)
        setBoard(newBoard)

        setNewColumnTitle('')
        toggleOpenNewColumnForm()
    }

    const onUpdateColumn = (newColumnToUpdate) => {
        const columnIdToUpdate = newColumnToUpdate._id

        let newColumns = [...columns]
        const columnIndexToUpdate = newColumns.findIndex(i => i._id === columnIdToUpdate)

        if (newColumnToUpdate._destroy) {
            //remove column
            newColumns.splice(columnIndexToUpdate, 1)
        } else {
            // update column info
            newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
        }

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c._id)

        newBoard.columns = newColumns

        setColumns(newColumns)
        setBoard(newBoard)
    }

    useEffect(() => {
        if (newColumnInputRef && newColumnInputRef.current) {
            newColumnInputRef.current.focus()
        }
    }, [openNewColumnForm])

    const onColumnDrop = (dropResult) => {
        let newColumns = [...columns]
        newColumns = applyDrag(newColumns, dropResult)

        let newBoard = { ...board }
        newBoard.columnOrder = newColumns.map(c => c._id)

        newBoard.columns = newColumns

        setBoard(newBoard)

        setColumns(newColumns)
    }

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            let newColumns = [...columns]
            let currentColumn = newColumns.find(c => c._id === columnId)
            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
            currentColumn.cardOrder = currentColumn.cards.map(i => i._id)

            setColumns(newColumns)
        }
    }

    if (isEmpty(board)) {
        return <div
            className="not-found"
            style={{ 'padding': '10px', 'color': 'white' }}
        >Board not found!</div>
    }

    return (
        <div className="board-content">
            <Container
                orientation="horizontal"
                onDrop={onColumnDrop}
                dragHandleSelector=".column-drag-handle"
                getChildPayload={index => columns[index]}
                dropPlaceholder={{
                    animationDuration: 150,
                    showOnTop: true,
                    className: 'column-drop-preview'
                }}
            >
                {columns.map((column, index) => (
                    <Draggable key={index}>
                        <Column
                            column={column}
                            onCardDrop={onCardDrop}
                            onUpdateColumn={onUpdateColumn}
                        />
                    </Draggable>
                ))}
            </Container>

            <BootstrapContainer className="trello-container">
                {!openNewColumnForm &&
                    <Row>
                        <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
                            <i className="fa fa-plus icon" /> Add another column
                        </Col>
                    </Row>
                }

                {openNewColumnForm &&
                    <Row>
                        <Col className="enter-new-column">
                            <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Enter title..."
                                className="input-enter-new-column"
                                ref={newColumnInputRef}
                                valure={newColumnTitle}
                                onChange={onNewColumnTitleChange}
                                onKeyDown={e => (e.key === 'Enter') && addNewColumn()}
                            />
                            <Button
                                variant="success"
                                size="sm"
                                className="add-new-column-btn"
                                onClick={addNewColumn}
                            >
                                Add column
                            </Button>
                            <span className="cancel-icon" onClick={toggleOpenNewColumnForm}>
                                <i className="fa fa-trash icon"></i>
                            </span>
                        </Col>
                    </Row>
                }
            </BootstrapContainer>
        </div>
    )
}

export default BoardContent