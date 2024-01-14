import React from 'react';
import styled from 'styled-components';
import Hero from '../assets/hero.svg';

import { SIDEBAR_LEFT_PADDING, HEADER_ALLOWANCE } from '../utils/constants';
import Button from '../Button';

const StyledContainer = styled.section`
  padding: ${() =>
    `0 ${SIDEBAR_LEFT_PADDING}vw 0 ${SIDEBAR_LEFT_PADDING * 3}vw`};
`;
const CTAContainer = styled.div`
  margin-top: ${() => `${HEADER_ALLOWANCE}vh`};
  > button:nth-child(1) {
    margin-right: 20px;
  }
`;

export const Home = () => (
  <StyledContainer>
    <Hero style={{ width: '90%' }} />
    <CTAContainer>
      <Button text='Get started' primary />
    </CTAContainer>
  </StyledContainer>
);
