import React, { Component } from 'react';
import styled from 'styled-components';
import LittleThing from './LittleThing';
import FinalistsBar from './FinalistsBar';

const StyledFinalists = styled.div`
   .littleThings {
      margin-top: 6rem;
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: space-around;
      article {
         width: 35rem;
         max-width: 60rem;
         display: flex;
         flex-grow: 1;
         flex-direction: column;
         margin: 1rem;
         &.eliminated {
            display: none;
         }
         article {
            width: 100%;
            box-shadow: none;
            margin: 0;
            &.finalist-1 {
               :before {
                  background: hsla(210, 70%, 16%, 0.7);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
            &.finalist-2 {
               :before {
                  background: hsla(30, 70%, 20%, 0.7);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
            &.finalist-3 {
               :before {
                  background: hsla(0, 70%, 17%, 0.7);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
            &.finalist-4 {
               :before {
                  background: hsla(42, 84%, 42%, 0.6);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
            &.finalist-5 {
               :before {
                  background: hsla(270, 70%, 15%, 0.7);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
            &.finalist-6 {
               :before {
                  background: hsla(120, 70%, 12%, 0.7);
                  box-shadow: none;
                  border-radius: 0;
                  opacity: 1;
               }
            }
         }
         .votePrompt {
            width: 100%;
            padding: 1rem 0 0 0;
            font-weight: 700;
            line-height: 0.6;
            text-shadow: 0 0 3px black;
            max-width: 60rem;
            text-align: center;
            border-radius: 3px 3px 0 0;
            position: relative;
            margin: 0;
            :after {
               content: '';
               background: ${props => props.theme.veryLowContrastCoolGrey};
               position: absolute;
               left: 0;
               top: 0;
               width: 100%;
               height: 100%;
            }
         }
      }
   }

   .barChunk {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid ${props => props.theme.background};
      height: 100%;
      text-shadow: 0 0 3px black;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      line-height: 1.75;
      overflow: hidden;
      transition: all 0.5s;
      box-shadow: 0 0.1rem 0.4rem
         ${props => props.theme.highContrastSecondaryAccent};
      &.eliminated {
         display: none;
      }
      &:last-of-type {
         border-right: none;
      }
      span.score {
         position: absolute;
         right: 0.25rem;
         bottom: 0.1rem;
         line-height: 1;
         opacity: 0.6;
         font-size: ${props => props.theme.smallText};
         font-weight: 500;
         text-shadow: none;
         color: ${props => props.theme.highContrastGrey};
      }
   }
   .barChunk:nth-of-type(6n + 1),
   article:nth-of-type(6n + 1) .votePrompt {
      background: hsla(210, 70%, 16%, 0.7);
   }
   .barChunk:nth-of-type(6n + 2),
   article:nth-of-type(6n + 2) .votePrompt {
      background: hsla(30, 70%, 20%, 0.7);
   }
   .barChunk:nth-of-type(6n + 3),
   article:nth-of-type(6n + 3) .votePrompt {
      background: hsla(0, 70%, 17%, 0.7);
   }
   .barChunk:nth-of-type(6n + 4),
   article:nth-of-type(6n + 4) .votePrompt {
      background: hsla(42, 84%, 42%, 0.6);
   }
   .barChunk:nth-of-type(6n + 5),
   article:nth-of-type(6n + 5) .votePrompt {
      background: hsla(270, 70%, 15%, 0.7);
   }
   .barChunk:nth-of-type(6n + 6),
   article:nth-of-type(6n + 6) .votePrompt {
      background: hsla(120, 70%, 12%, 0.7);
   }
`;

class Finalists extends Component {
   render() {
      const littleThingsArray = this.props.things.map((thing, index) => (
         <article
            className={thing.eliminated ? 'eliminated' : 'notEliminated'}
            key={thing.id}
         >
            <div className="votePrompt">!vote{index + 1}</div>
            <LittleThing thing={thing} finalistNumber={(index % 6) + 1} />
         </article>
      ));

      return (
         <StyledFinalists>
            <FinalistsBar things={this.props.things} />
            <div className="littleThings">{littleThingsArray}</div>
         </StyledFinalists>
      );
   }
}

export default Finalists;
