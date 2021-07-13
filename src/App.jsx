import React, { createContext, useMemo, useReducer } from 'react';
import Form from './components/Form/Form';
import Table from './components/Table';
import "./App.css";

export const CODE = {
  MINE: -7,
  NORMAL: -1,
  QUESTION: -2,
  FLAG: -3,
  QUESTION_MINE: -4,
  FLAG_MINE: -5,
  CLICKED_MINE: -6,
  OPENED: 0,
}

export const TableContext = createContext({
  tableData: [],
  halted: true,
  dispatch: () => { }
});

const initialState = {
  tableData: [],
  timer: 0,
  result: '',
  halted: false,
}

const plantMine = (row, cell, mine) => {
  console.log(row, cell, mine);
  const candidate = Array(row * cell).fill().map((arr, i) => {
    return i;
  })
  const shuffle = [];
  while (candidate.length > row * cell - mine) {
    const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
    shuffle.push(chosen);
  }
  const data = []
  for (let i = 0; i < row; i++) {
    const rowData = [];
    data.push(rowData)
    for (let j = 0; j < cell; j++) {
      rowData.push(CODE.NORMAL)
    }
  }

  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k] / cell);
    const hor = shuffle[k] % cell;
    data[ver][hor] = CODE.MINE;
  }

  console.log(data)
  return data;

}

export const START_GAME = 'START_GAME'
export const OPEN_CELL = 'OPEN_CELL'
export const CLICK_MINE = 'CLICK_MINE'
export const FLAG_CELL = 'FLAG_CELL'
export const QUESTION_CELL = 'QUESTION_CELL'
export const NORMALIZE_CELL = 'NORMALIZE_CELL'

const reducer = (state, action) => {
  switch (action.type) {
    case START_GAME:
      return {
        ...state,
        tableData: plantMine(action.row, action.cell, action.mine),
        halted: false,
      }
    case OPEN_CELL: {
      const tableData = [...state.tableData];
      let visited = new Array(tableData.length);
      for (let i = 0; i < visited.length; i++) {
        visited[i] = new Array(visited.length).fill(false);
      }

      const checkAround = (row, cell) => {
        if (row < 0 || row >= tableData.length || cell < 0 || cell >= tableData.length) {
          return;
        }
        if (visited[row][cell])
          return;

        let around = [];

        if (tableData[row - 1]) {
          around = around.concat(
            tableData[row - 1][cell - 1],
            tableData[row - 1][cell],
            tableData[row - 1][cell + 1]
          )
        }
        around = around.concat(
          tableData[row][cell - 1],
          tableData[row][cell + 1]
        )
        if (tableData[row + 1]) {
          around = around.concat(
            tableData[row + 1][cell - 1],
            tableData[row + 1][cell],
            tableData[row + 1][cell + 1]
          )
        }

        const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)).length;
        tableData[row][cell] = count;
        visited[row][cell] = true;

        return count;
      }

      let queue = [[action.row, action.cell]];
      while (queue.length !== 0) {
        const [row, cell] = queue.shift();
        console.log(row, cell)
        const count = checkAround(row, cell)
        if (count === 0) {
          queue.push([row - 1, cell - 1], [row - 1, cell], [row - 1, cell + 1], [row, cell - 1]
            , [row, cell + 1], [row + 1, cell - 1], [row + 1, cell], [row + 1, cell + 1])
        }
      }

      return {
        ...state,
        tableData,
      }
    }
    case CLICK_MINE: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData[action.row][action.cell] = CODE.CLICKED_MINE;
      return {
        ...state,
        tableData,
        halted: true,
      }
    }
    case FLAG_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.MINE) {
        tableData[action.row][action.cell] = CODE.FLAG_MINE;
      } else {
        tableData[action.row][action.cell] = CODE.FLAG;
      }
      return {
        ...state,
        tableData,
      }
    }
    case QUESTION_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.FLAG_MINE) {
        tableData[action.row][action.cell] = CODE.QUESTION_MINE;
      } else {
        tableData[action.row][action.cell] = CODE.QUESTION;
      }
      return {
        ...state,
        tableData,
      }
    }
    case NORMALIZE_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.QUESTION_MINE) {
        tableData[action.row][action.cell] = CODE.MINE;
      } else {
        tableData[action.row][action.cell] = CODE.NORMAL;
      }
      return {
        ...state,
        tableData,
      }
    }
    default:
      return state;
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { tableData, halted, timer, result } = state;
  //Provider로 넘길때 이렇게 캐싱해 놓지 않으면 매번 자식 컴포넌트들이 리렌더링 되므로 성능 최적화를 위해 useMemo를 사용해준다.
  const value = useMemo(() => ({ tableData, halted, dispatch }), [tableData, halted])

  return (
    <TableContext.Provider value={value}>
      <Form />
      <div>{timer}</div>
      <Table />
      <div>{result}</div>
    </TableContext.Provider>
  );
};

export default App;