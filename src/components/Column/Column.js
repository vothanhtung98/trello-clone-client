import React, { useState, useEffect, useRef } from 'react'
import './Column.scss'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { Container, Draggable } from 'react-smooth-dnd'
import { cloneDeep } from 'lodash'

import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import { mapOrder } from 'utilities/sorts'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { saveContentAfterPressEnter, selectAllInlineText } from 'utilities/contentEditable'
import { createNewCard, updateColumn } from 'actions/ApiCall'

function Column(props) {
    const { column, onCardDrop, onUpdateColumnState } = props
    const cards = mapOrder(column.cards, column.cardOrder, '_id')

    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

    const [columnTitle, setColumnTitle] = useState('')
    const handleColumnTitleChange = (e) => setColumnTitle(e.target.value)

    const [openNewCardForm, setOpenNewCardForm] = useState(false)
    const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

    const [newCardTitle, setNewCardTitle] = useState('')
    const onNewCardTitleChange = (e) => { setNewCardTitle(e.target.value) }

    const newCardTextareaRef = useRef(null)

    useEffect(() => {
        setColumnTitle(column.title)
    }, [column.title])

    useEffect(() => {
        if (newCardTextareaRef && newCardTextareaRef.current) {
            newCardTextareaRef.current.focus()
        }
    }, [openNewCardForm])

    // Remove Column
    const onConfirmModalAction = (type) => {
        if (type === MODAL_ACTION_CONFIRM) {
            const newColumn = {
                ...column,
                _destroy: true
            }

            // Call Api Update
            updateColumn(newColumn._id, newColumn).then(updatedColumn => {
                onUpdateColumnState(updatedColumn)
            })
        }
        toggleShowConfirmModal()
    }

    // Update Column's title
    const handleColumnTitleBlur = () => {
        if (columnTitle !== column.title) {
            const newColumn = {
                ...column,
                title: columnTitle
            }

            // Call Api Update
            updateColumn(newColumn._id, newColumn).then(updatedColumn => {
                updatedColumn.cards = newColumn.cards
                onUpdateColumnState(updatedColumn)
            })
        }
    }

    const addNewCard = () => {
        if (!newCardTitle) {
            newCardTextareaRef.current.focus()
            return
        }

        const newCardToAdd = {
            boardId: column.boardId,
            columnId: column._id,
            title: newCardTitle.trim()
        }

        createNewCard(newCardToAdd).then(card => {
            let newColumn = cloneDeep(column)
            newColumn.cards.push(card)
            newColumn.cardOrder.push(card._id)

            onUpdateColumnState(newColumn)
            setNewCardTitle('')
            toggleOpenNewCardForm()
        })
    }

    return (
        <div className="column">
            <header className="column-drag-handle">
                <div className="column-title">
                    <Form.Control
                        size="sm"
                        type="text"
                        className="trello-content-editable"
                        value={columnTitle}
                        onChange={handleColumnTitleChange}
                        onBlur={handleColumnTitleBlur}
                        onKeyDown={saveContentAfterPressEnter}
                        onClick={selectAllInlineText}
                        onMouseDown={e => e.preventDefault()}
                        spellCheck="false"
                    />
                </div>
                <div className="column-dropdown-actions">
                    <Dropdown>
                        <Dropdown.Toggle size="sm" id="dropdown-basic" className="dropdown-btn" />

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={toggleOpenNewCardForm}>Add Card...</Dropdown.Item>
                            <Dropdown.Item onClick={toggleShowConfirmModal}>Remove Column...</Dropdown.Item>
                            <Dropdown.Item>Move All Cards (beta)...</Dropdown.Item>
                            <Dropdown.Item>Archive All Cards (beta)...</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </header>
            <div className={openNewCardForm ? 'card-list new-card-form-open' : 'card-list'}>
                <Container
                    groupName="columns"
                    onDrop={dropResult => onCardDrop(column._id, dropResult)}
                    getChildPayload={index => cards[index]}
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                    dropPlaceholder={{
                        animationDuration: 150,
                        showOnTop: true,
                        className: 'card-drop-preview'
                    }}
                    dropPlaceholderAnimationDuration={200}
                >
                    {cards.map((card, index) => (
                        <Draggable key={index}>
                            <Card card={card} />
                        </Draggable>
                    ))}
                </Container>
                {openNewCardForm &&
                    <div className="add-new-card-area">
                        <Form.Control
                            size="sm"
                            as="textarea"
                            row="3"
                            placeholder="Enter a title for this card..."
                            className="textarea-enter-new-card"
                            ref={newCardTextareaRef}
                            valure={newCardTitle}
                            onChange={onNewCardTitleChange}
                            onKeyDown={e => (e.key === 'Enter') && addNewCard()}
                        />
                    </div>
                }
            </div>
            <footer>
                {openNewCardForm &&
                    <div className="add-new-card-actions">
                        <Button
                            variant="success"
                            size="sm"
                            className="add-new-card-btn"
                            onClick={addNewCard}
                        >
                            Add card
                        </Button>
                        <span className="cancel-icon" onClick={toggleOpenNewCardForm}>
                            <i className="fa fa-trash icon"></i>
                        </span>
                    </div>
                }
                {!openNewCardForm &&
                    <div className="footer-actions" onClick={toggleOpenNewCardForm}>
                        <i className="fa fa-plus icon" /> Add another card
                    </div>
                }
            </footer>

            <ConfirmModal
                show={showConfirmModal}
                onAction={onConfirmModalAction}
                title="Remove Column"
                content={`Are you sure? All cards in <strong>${column.title}</strong> will be removed!`}
            />
        </div>
    )
}

export default Column