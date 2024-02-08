import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; // ใช้การ import named export 'thunk'
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;