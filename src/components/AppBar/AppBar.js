import React from 'react'
import './AppBar.scss'
import { Container as BootstrapContainer, Row, Col, InputGroup, FormControl } from 'react-bootstrap'
import myavatar from 'assets/images/avatars/avatar.jpg'

function AppBar() {
    return (
        <nav className="navbar-app">
            <BootstrapContainer className="navbar-trello-container">
                <Row>
                    <Col md={5} sm={7} className="col-no-padding d-none d-sm-block">
                        <div className="app-actions">
                            <div className="item all"><i className="fa fa-th" /></div>
                            <div className="item home"><i className="fa fa-home" /></div>
                            <div className="item boards"><i className="fa fa-columns" />&nbsp;&nbsp;<strong>Boards</strong></div>
                            <div className="item search">
                                <InputGroup className="group-search">
                                    <FormControl
                                        className="input-search"
                                        placeholder="Jump to..."
                                    />
                                    <InputGroup.Text className="input-icon-search"><i className="fa fa-search" /></InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                    </Col>
                    <Col md={2} xs={12} className="col-no-padding d-none d-md-block">
                        <div className="app-branding text-center">
                            <a href="https://github.com/vothanhtung98" target="blank">
                                <div className="trello-slogan">My Trello</div>
                            </a>
                        </div>
                    </Col>
                    <Col xs={12} className="col-no-padding d-block d-sm-none">
                        <div className="app-branding text-center">
                            <a href="https://github.com/vothanhtung98" target="blank">
                                <div className="trello-slogan">Trello - Made by VOTHANHTUNG</div>
                            </a>
                        </div>
                    </Col>
                    <Col md={5} sm={5} className="col-no-padding d-none d-sm-block">
                        <div className="user-actions">
                            <div className="item quick"><i className="fa fa-plus-square-o" /></div>
                            <div className="item news"><i className="fa fa-info-circle" /></div>
                            <div className="item notification"><i className="fa fa-bell-o" /></div>
                            <div className="item user-avatar">
                                <img src={myavatar} alt="avatar" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </BootstrapContainer>
        </nav>
    )
}

export default AppBar