import React, { useState, useEffect, useRef } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { Container, Draggable } from 'react-smooth-dnd'

import {
    Container as BootstrapContainer,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap'

import './BoardContent.scss'

import Column from 'components/Column/Column'
import { mapOrder } from 'utilities/sorts'
import { applyDrag } from 'utilities/dragDrop'

import {
    fetchBoardDetails,
    createNewColumn,
    updateBoard,
    updateColumn,
    updateCard
} from 'actions/ApiCall'

function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])

    const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

    const [newColumnTitle, setNewColumnTitle] = useState('')
    const onNewColumnTitleChange = (e) => { setNewColumnTitle(e.target.value) }

    // Get board's data
    useEffect(() => {
        const boardId = '624ee6452281054bcfad4e44'
        // Call Api get full board
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
            boardId: board._id,
            title: newColumnTitle.trim()
        }

        let newColumns = cloneDeep(columns)
        newColumns.push(newColumnToAdd)

        let newBoard = cloneDeep(board)
        newBoard.columnOrder = newColumns.map(c => c._id)

        newBoard.columns = newColumns

        setColumns(newColumns)
        setBoard(newBoard)

        setNewColumnTitle('')
        toggleOpenNewColumnForm()

        // Call Api createNewColumn
        createNewColumn(newColumnToAdd).catch(() => {
            setColumns(columns)
            setBoard(board)
        })
    }

    const onUpdateColumnState = (newColumnToUpdate) => {
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

    // Focus input when open add new column form
    useEffect(() => {
        if (newColumnInputRef && newColumnInputRef.current) {
            newColumnInputRef.current.focus()
        }
    }, [openNewColumnForm])

    const onColumnDrop = (dropResult) => {
        if (dropResult.removedIndex !== dropResult.addedIndex) {
            let newColumns = cloneDeep(columns)
            newColumns = applyDrag(newColumns, dropResult)
            let newBoard = cloneDeep(board)
            newBoard.columnOrder = newColumns.map(c => c._id)
            newBoard.columns = newColumns
            setColumns(newColumns)
            setBoard(newBoard)

            // Call Api update columnOrder in board
            updateBoard(newBoard._id, newBoard).catch(() => {
                setColumns(columns)
                setBoard(board)
            })
        }
    }

    const onCardDrop = (columnId, dropResult) => {
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            let newColumns = cloneDeep(columns)
            let currentColumn = newColumns.find(c => c._id === columnId)
            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
            currentColumn.cardOrder = currentColumn.cards.map(i => i._id)

            setColumns(newColumns)

            if (dropResult.removedIndex !== null && dropResult.addedIndex !== null) {
                if (dropResult.removedIndex !== dropResult.addedIndex) {
                    // Move card in side it's column: Call Api update cardOrder in this column
                    updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(columns))
                }
            } else {
                // Move card between 2 columns: Call Api update cardOrder + columnId in 2 columns
                updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(columns))

                if (dropResult.addedIndex !== null) {
                    let currentCard = cloneDeep(dropResult.payload)
                    currentCard.columnId = currentColumn._id

                    // Call Api update columnId of card
                    updateCard(currentCard._id, currentCard)
                    // .catch(()=>)
                }
            }
        }
    }

    if (isEmpty(board)) {
        return <div
            className="not-found"
            style={{ 'padding': '10px', 'color': 'white' }}
        >Loading...</div>
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
                            onUpdateColumnState={onUpdateColumnState}
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