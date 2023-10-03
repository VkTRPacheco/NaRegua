import { all, takeLatest, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import { updateAgendamento} from './action'
import consts from '../../../consts';
import types from './types'


export function* filterAgendamento({start, end}) {
    try {
        const {data: res} = yield call(api.post, 'agendamentp/filter', {
            salaoId : consts.salaoId,
            periodo: {
                inicio: start,
                final: end,
            },
        });

        if (res.error) {
            alert(res.message);
            return false
        }

        yield put(updateAgendamento(res.agendamentos))

    } catch (err) {
        alert(err.message);
    }
}

export default all([takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamento)]);