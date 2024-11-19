import {
  FC,
  FormEvent,
  useState,
  useRef,
  useEffect,
  memo,
  Dispatch,
} from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { MdDoneOutline } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { Draggable } from '@hello-pangea/dnd';
import Button from './Button';
import { Target, TodoActions } from '../context/todoReducer';
import { Todo } from '../models';
import Modal from './Modal';

interface TodoItemProps {
  index: number;
  todo: Todo;
  dispatch: Dispatch<TodoActions>;
}

// * Check this component and functions on right using todos and doneTodos
const TodoItem: FC<TodoItemProps> = memo(({ index, todo, dispatch }) => {
  const [edit, setEdit] = useState(false);
  const [editTodoText, setEditTodoText] = useState<string>(todo.todoText);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edit) {
      inputRef?.current?.focus();
    }
  }, [edit, isModalOpen]);

  const handleDone = (id: string, target: Target): void => {
    dispatch({ type: 'DONE-TODO', payload: { id, target } });
    dispatch({ type: 'MOVE-TODO-BETWEEN-LISTS', payload: { target } });
    dispatch({ type: 'DELETE-TODO', payload: { id, target } });
  };

  const handleDelete = (id: string): void => {
    dispatch({ type: 'DELETE-TODO', payload: { id, target: 'todos' } });
    dispatch({
      type: 'DELETE-TODO',
      payload: { id, target: 'doneTodos' },
    });
  };

  const handleToggleEdit = (): void => {
    if (!edit && !todo.done) {
      setEdit(true);
    }
  };

  const toggleModal = () => {
    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

  //TODO: Review this function and where it's using below this code, because uses only for todos not for doneTodos
  //TODO: Consider adding a condition for an empty string
  const handleEdit = (event: FormEvent, id: string): void => {
    event.preventDefault();

    if (editTodoText.trim().length === 0) {
      toggleModal();
      return;
    }

    dispatch({
      type: 'EDIT-TODO',
      payload: { id, editTodoText, target: 'todos' },
    });
    // dispatch({
    // 	type: 'EDIT-TODO',
    // 	payload: { id, editTodoText, target: 'doneTodos' },
    // });

    setEdit(false);
  };

  return (
    <>
      <Draggable draggableId={todo.id.toString()} index={index}>
        {(provided) => (
          <form
            // Change from form to li and add - className="todo-edit-item"
            className="todo-edit-form"
            onSubmit={(event) => handleEdit(event, todo.id)}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <div className="todo-control-buttons">
              {!todo.done ? (
                <Button
                  className="todo-control-btn"
                  disabled={edit}
                  onClick={() => handleDone(todo.id, 'todos')}
                >
                  <MdDoneOutline />
                </Button>
              ) : (
                <Button
                  className="todo-control-btn"
                  onClick={() => handleDone(todo.id, 'doneTodos')}
                >
                  <RiArrowGoBackFill />
                </Button>
              )}
            </div>
            {edit ? (
              <input
                type="text"
                className="todo-text"
                value={editTodoText}
                onChange={(event) => setEditTodoText(event.target.value)}
                // onBlur={(event) => {
                // 	handleEdit(event, todo.id);
                // 	inputRef.current?.blur();
                // }}
                ref={inputRef}
              />
            ) : (
              <p
                style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
                className="todo-text"
              >
                {todo.todoText}
              </p>
            )}
            <div className="todo-control-buttons">
              {todo.done || edit || (
                <Button className="todo-control-btn" onClick={handleToggleEdit}>
                  <FaEdit />
                </Button>
              )}
              {edit && (
                <Button type="submit" className="todo-control-btn">
                  <FaPlus />
                </Button>
              )}
              <Button
                className="todo-control-btn"
                disabled={edit}
                onClick={() => handleDelete(todo.id)}
              >
                <FaTrash />
              </Button>
            </div>
          </form>
        )}
      </Draggable>
      {isModalOpen && (
        <Modal
          onClose={toggleModal}
          title="Error"
          message="The already created task cannot be empty. Edit it correctly."
        />
      )}
    </>
  );
});

export default TodoItem;