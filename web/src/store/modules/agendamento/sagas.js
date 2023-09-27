import { all, take, takeLatest } from 'redux-saga/effects';
import api from '../../../services/api'

export function* filterAgendamento({start, end}) {
    try {

    } catch (err) {
        alert(err.message);
    }
}

export default all([takeLatest('@agendamento/FILTER', filterAgendamento)]);