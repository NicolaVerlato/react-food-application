import { Fragment, useContext, useState } from 'react';

import Modal from '../UI/Modal';
import CartItem from './CartItem'
import CartContext from '../../store/cart-context';
import classes from './Cart.module.css'
import Checkout from './Checkout';

function Cart(props) {
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [didSubmit, setDidSubmit] = useState(false);
    const cartCtx = useContext(CartContext);

    const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
    const hasItems = cartCtx.items.length > 0

    function cartItemRemoveHandler(id) {
        cartCtx.removeItem(id)
    }

    function cartItemAddHandler(item) {
        cartCtx.addItem({...item, amount: 1})
    }
    
    const submitDataHandler = async (userData) => {
        setIsSubmitting(true)
        await fetch('https://react-meals-47ce7-default-rtdb.firebaseio.com/orders.json', {
            method: 'POST',
            body: JSON.stringify({
                user: userData,
                orderItems: cartCtx.items
            })
        })
        setIsSubmitting(false);
        setDidSubmit(true);
        cartCtx.clearCart();
    }
    
    const cartItems = <ul className={classes['cart-items']}> 
        {cartCtx.items.map(item => 
            <CartItem 
                key={item.id}
                name={item.name}
                amount={item.amount}
                price={item.price}
                onRemove={cartItemRemoveHandler.bind(null, item.id)}
                onAdd={cartItemAddHandler.bind(null, item)}
            />
        )}
    </ul>;

    function orderHandler() {
        setShowCheckout(true)
    }

    const modalActions = 
        <div className={classes.actions}>
            <button 
                className={classes['button--alt']}
                onClick={props.onClose}    
            >Close</button>
            {hasItems && <button className={classes.button} onClick={orderHandler}>Order</button>}
        </div>

    const cartModalContent = <Fragment>
        {cartItems}
            <div className={classes.total}>
                <span>Total Amount</span>
                <span>{totalAmount}</span>
            </div>
            {showCheckout && <Checkout onConfirm={submitDataHandler} onCancel={props.onClose}/>}
            {!showCheckout && modalActions}
        </Fragment>

    const isSubmittingOrderData = <p>Sending order data...</p>
    const didSubmitModalContent = <p>Successfully sent the order!</p>
    return(
        <Modal onClose={props.onClose}>
            {!isSubmitting && !didSubmit && cartModalContent}
            {isSubmitting && isSubmittingOrderData}
            {!isSubmitting && didSubmit && didSubmitModalContent}
        </Modal>
    )
}

export default Cart;