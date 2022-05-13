import React, { useState, useEffect, useRef } from 'react'
import './Card.scss'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import { updateCard } from 'actions/ApiCall'
import { saveContentAfterPressEnter, selectAllInlineText } from 'utilities/contentEditable'
import CloseButton from 'react-bootstrap/CloseButton'
import backgroundArray from 'utilities/backgroundArray'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import ConfirmModal from 'components/Common/ConfirmModal'
import { MODAL_ACTION_CONFIRM, MODAL_ACTION_CLOSE } from 'utilities/constants'

function Card(props) {
    const { card, columnTitle, onUpdateCardState } = props

    const [cardTitle, setCardTitle] = useState('')
    const handleCardTitleChange = (e) => setCardTitle(e.target.value)

    const [showCardModal, setShowCardModal] = useState(false)
    const toggleShowCardModal = () => setShowCardModal(!showCardModal)

    const [showDeleteCardModal, setShowDeleteCardModal] = useState(false)
    const toggleShowDeleteCardModal = () => setShowDeleteCardModal(!showDeleteCardModal)

    const [openAddDescriptionForm, setOpenAddDescriptionForm] = useState(false)
    const toggleOpenAddDescriptionForm = () => setOpenAddDescriptionForm(!openAddDescriptionForm)

    const [description, setDescription] = useState('')
    const onDescriptionChange = (e) => { setDescription(e.target.value) }

    const [cardCover, setCardCover] = useState('')

    const descriptionTextareaRef = useRef(null)

    useEffect(() => {
        setCardTitle(card.title)
    }, [card.title])

    useEffect(() => {
        setDescription(card.description)
    }, [card.description])

    useEffect(() => {
        setCardCover(card.cover)
    }, [card.cover])

    useEffect(() => {
        if (descriptionTextareaRef && descriptionTextareaRef.current) {
            descriptionTextareaRef.current.focus()
        }
    }, [openAddDescriptionForm])

    const handleClose = () => {
        toggleShowCardModal()
        setOpenAddDescriptionForm(false)
    }

    const handleCancelDescriptionChange = () => {
        setDescription(card.description)
        toggleOpenAddDescriptionForm()
    }

    // Update Card's title
    const handleCardTitleBlur = () => {
        if (cardTitle !== card.title) {
            const newCard = {
                ...card,
                title: cardTitle
            }

            // Call Api Update card's title
            updateCard(card._id, newCard).then(card => onUpdateCardState(card))
        }
    }

    // Add or update card's description
    const addDescription = () => {
        if (!description) {
            descriptionTextareaRef.current.focus()
            return
        } else if (description == card.description) {
            toggleOpenAddDescriptionForm()
            return
        }

        const newCardWithDescription = {
            ...card,
            description: description.trim()
        }

        toggleOpenAddDescriptionForm()

        // Call Api update description of card
        updateCard(card._id, newCardWithDescription).then(card => onUpdateCardState(card))
    }

    // Change card's cover
    const changeCover = (imgIndex) => {
        const newCard = {
            ...card,
            cover: backgroundArray[imgIndex]
        }
        setCardCover(backgroundArray[imgIndex])

        // Call Api updated cover of card
        updateCard(card._id, newCard).then(card => onUpdateCardState(card))
    }

    // Remove card's cover
    const removeCover = () => {
        const newCard = {
            ...card,
            cover: ''
        }

        setCardCover('')

        // Call Api updated cover of card
        updateCard(card._id, newCard).then(card => onUpdateCardState(card))
    }

    // Remove card
    const onConfirmModalAction = (type) => {
        if (type === MODAL_ACTION_CONFIRM) {
            const newCard = {
                ...card,
                _destroy: true
            }
            // Call Api Update
            updateCard(newCard._id, newCard).then(card => {
                onUpdateCardState(card)
            })
        }
        if (type === MODAL_ACTION_CLOSE) {
            toggleShowDeleteCardModal()
            return
        }
        toggleShowDeleteCardModal()
        toggleShowCardModal()
    }

    const imageStyle = {
        backgroundImage: `url(${cardCover})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '250px'
    }

    return (
        <div className="card-item">
            {cardCover &&
                <div className="card-cover">
                    <img
                        src={cardCover}
                        className="cover-img"
                        alt="alt-img"
                        onMouseDown={e => e.preventDefault()}
                    />
                </div>
            }
            <div className="card-title">{card.title}</div>
            <div className="card-view">
                <Button size="sm" className="view-btn" onClick={toggleShowCardModal}>
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </Button>
            </div>
            <Modal show={showCardModal} onHide={handleClose}>
                <Modal.Header className="modal-view-head" style={cardCover ? imageStyle : { backgroundColor: 'rgba(4,44,100,0.8)' }} >
                    <CloseButton variant="white" onClick={handleClose} />
                    <Dropdown>
                        <Dropdown.Toggle size="sm" id="dropdown-basic" className="dropdown-btn"><i className="fa fa-picture-o" aria-hidden="true"></i> Cover</Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                            <Dropdown.Header className="dropdown-header">Choose a cover image</Dropdown.Header>
                            {showCardModal &&
                                <div className="image-container">
                                    {backgroundArray.map((img, index) =>
                                        <Dropdown.Item key={index} onClick={() => changeCover(index)}>
                                            <img src={img} alt={`background-${index}`} />
                                        </Dropdown.Item>)}
                                    {cardCover &&
                                        <DropdownItem className="image-remover" onClick={removeCover}>
                                            <i className="fa fa-trash icon"></i>
                                            Remove cover image
                                        </DropdownItem>
                                    }
                                </div>
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Header>
                <Modal.Body className="modal-view-body">
                    <div className="card-view-head">
                        <div className="head-icon">
                            <i className="fa fa-address-card-o" aria-hidden="true"></i>
                        </div>
                        <div className="head-details">
                            <div className="card-view-title">
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    className="trello-content-editable"
                                    value={cardTitle}
                                    onChange={handleCardTitleChange}
                                    onBlur={handleCardTitleBlur}
                                    onKeyDown={saveContentAfterPressEnter}
                                    onClick={selectAllInlineText}
                                    onMouseDown={e => e.preventDefault()}
                                    spellCheck="false"
                                />
                            </div>
                            <div>in list <strong>{columnTitle}</strong></div>
                        </div>
                    </div>
                    <div className="card-view-body">
                        <div className="body-icon">
                            <i className="fa fa-info" aria-hidden="true"></i>
                        </div>
                        <div className="body-details">
                            <div className="card-view-description">Description</div>
                            {description && !openAddDescriptionForm &&
                                <div>
                                    {description}
                                    <span className="description-edit-icon" onClick={toggleOpenAddDescriptionForm}>
                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                    </span>
                                </div>
                            }
                            {!description && !openAddDescriptionForm &&
                                <div className="add-description-icon" onClick={toggleOpenAddDescriptionForm}>
                                    <i className="fa fa-plus icon" /> Add description
                                </div>
                            }
                            {openAddDescriptionForm &&
                                <>
                                    <div className="add-description-area">
                                        <Form.Control
                                            size="sm"
                                            as="textarea"
                                            row="3"
                                            placeholder="Add a more detailed description..."
                                            className="textarea-enter-description"
                                            ref={descriptionTextareaRef}
                                            value={description}
                                            onChange={onDescriptionChange}
                                            onKeyDown={e => (e.key === 'Enter') && addDescription()}
                                            spellCheck='false'
                                        />
                                    </div>
                                    <div className="add-description-actions">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="add-description-btn"
                                            onClick={addDescription}
                                        >
                                            Save
                                        </Button>
                                        <span className="cancel-icon" onClick={handleCancelDescriptionChange}>
                                            <i className="fa fa-trash icon"></i>
                                        </span>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                    <div className="card-view-footer">
                        <Button size="sm" className="del-card-btn" onClick={toggleShowDeleteCardModal}>
                            <i className="fa fa-trash icon"></i>
                            Delete this card
                        </Button>

                        <ConfirmModal
                            show={showDeleteCardModal}
                            size="sm"
                            onAction={onConfirmModalAction}
                            title="Remove Card"
                            content={`Are you sure? <strong>${card.title}</strong> will be removed!`}
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Card