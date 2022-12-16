import React, { useEffect, useCallback, useState } from 'react';
import { getInstance as gs } from '@ombori/grid-signals-react';
import styled from 'styled-components';
import { useSettings, useGridSignalsInitParams } from '@ombori/ga-settings';
import { useHeartbeat } from '@ombori/ga-messaging';
import logo from './logo.svg';

import { Schema as Settings } from './schema';

function App() {
  useHeartbeat();
  const [productCount, setProductCount] = useState(0);
  const settings = useSettings<Settings>();
  const signalsParams = useGridSignalsInitParams();

  console.log('========app logs==================');
  console.log('settings:', JSON.stringify(settings));
  console.log('signalsParams:', JSON.stringify(signalsParams));
  console.log('window.location:', JSON.stringify(window.location));

  const productName = settings?.productName;
  const productPrice = settings?.productPrice;

  useEffect(() => {
    if (productName) {
      gs().sendContentView({ title: productName });
    }
  }, [productName]);

  useEffect(() => {
    const startSessionSubscription = async () => {
      const sessionState = await gs().subscribeSessionState((sessionState: any) => {
        setProductCount(sessionState.CART['TEMPORARY-PRODUCT-ID-123']);
      });

      const spaceEvents = await gs().subscribeSpaceEvent((spaceEvent: any) => {
        console.log('spaceEvent:', JSON.stringify(spaceEvent));
      });

      const spaceState = await gs().subscribeSpaceState((spaceState: any) => {
        console.log('spaceState:', JSON.stringify(spaceState));
      });
  
      return () => {
        sessionState.stop();
        spaceEvents.stop();
        spaceState.stop();
      }
    }

    startSessionSubscription();
  }, []);

  const onAddToCart = useCallback(() => {
    gs().sendCartAdd({ productId: 'TEMPORARY-PRODUCT-ID-123', quantity: 1 })
  }, []);

  if (!settings) {
    return <Container>Loading gridapp settings...</Container>
  }

  return (
    <Container>
      <ProductInfo>
        <Logo src={logo} alt="logo" />
        <p>Product name: {productName}</p>
        <p>Product price: {productPrice}</p>
        <Button onClick={onAddToCart}>Add to Cart</Button>
      </ProductInfo>
      <RealTimeInfo>
        <p>Real Cart Subscription</p>
        <p>{productName} count: {productCount}</p>
      </RealTimeInfo>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  background-color: #282c34;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  width: 100%;
  color: white;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 1.5vmin);
`;

const ProductInfo = styled.header`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 64px;
  border-right: solid 1px white;
`;

const Logo = styled.img`
  height: 40vmin;
  pointer-events: none;
`;

const Button = styled.button`
  padding: 16px 32px;
  margin-top: 24px;
  align-self: center;
  border-radius: 8px;
`;

const RealTimeInfo = styled.footer`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  pointer-events: none;
  align-items: center;
  justify-content: center;
`;

export default App;
