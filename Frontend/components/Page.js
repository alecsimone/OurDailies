import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Header from './Header';
import Meta from './Meta';

const theme = {
    black: 'hsl(200, 17%, 7%)', 
    white: 'hsl(30, 5%, 90%)',
    blue: 'hsl(210, 100%, 67%)',
    gold: 'hsl(42, 61%, 93%)',
    darkBlue: 'hsl(210, 100%, 33%)',
    darkGrey: 'hsl(30, 10%, 33%)',
    lightGrey: 'hsl(30, 10%, 67%)',
}

injectGlobal`
    html {
        background: ${theme.black};
        font-family: sans-serif;
        font-size: 12px;
        box-sizing: border-box;
    }
    *, *:before, *:after {
        box-sizing: inherit;
    }
    body {
        padding: 0;
        margin: 0;
        font-size: 1.5rem;
        line-height: 2;
    }
    a {
        text-decoration: none;
    }
`;

class Page extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <div>
                    <Meta />
                    <Header />
                    {this.props.children}
                </div>
            </ThemeProvider>
        );
    }
}

export default Page;