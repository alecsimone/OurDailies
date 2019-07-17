import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Header from './Header';
import Meta from './Meta';

const theme = {
    black: 'hsl(216, 24%, 4%)', 
    white: 'hsl(33, 17%, 88%)',
    blue: 'hsl(210, 100%, 34%)',
    gold: 'hsl(42, 79%, 64%)',
    darkBlue: 'hsl(210, 100%, 16%)',
    darkGrey: 'hsl(30, 10%, 33%)',
    lightGrey: 'hsl(28, 9%, 64%)',
}

injectGlobal`
    html {
        background: ${theme.black};
        color: ${theme.white};
        font-family: "Proxima Nova", sans-serif;
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
    }
    a {
        text-decoration: none;
        color: ${theme.white};
        :visited {
            color: ${theme.white};
        }
        :hover {
            text-decoration: underline;
        }
    }
`;

const StyledPage = styled.div`
    width: 94%;
    max-width: 1920px;
    margin: 2rem auto;
`;

class Page extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <StyledPage>
                    <Meta />
                    <Header />
                    {this.props.children}
                </StyledPage>
            </ThemeProvider>
        );
    }
}

export default Page;