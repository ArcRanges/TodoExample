import React from 'react';
import { ScrollView, StyleSheet, StatusBar, FlatList } from 'react-native';
import CONSTANTS from '../constants';
import { ReactiveList } from '@appbaseio/reactivesearch-native';
import { View, Text } from 'native-base';
import Utils from '../utils';

import AddTodoButton from './AddTodoButton';
import AddTodo from './AddTodo';
import TodoModel from './../api/todos';
import TodoItem from './TodoItem';

import Header from '../components/Header';
import COLORS from '../constants/Colors';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  row: {
    top: 15,
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// will render todos based on the active screen: all, active or completed
export default class TodosContainer extends React.Component {
  state = {
    addingTodo: false,
  }
  componentDidMount() {
    // includes the methods for creation, updation and deletion
    this.api = new TodoModel('react-todos');
  }

  onAllData = (todos, streamData) => {
    // merge streaming todos data along with current todos
    const todosData = Utils.mergeTodos(todos, streamData);

    // filter data based on "screen": [All | Active | Completed]
    const filteredData = this.filterTodosData(todos);

    return (
      <FlatList
        style={{ width: '100%', top: 15 }}
        data={filteredData}
        keyExtractor={item => item._id}
        renderItem={({ item: todo }) => (
          <TodoItem
            todo={todo}
            onUpdate={this.api.update}
            onDelete={this.api.destroy} />
        )}
      />
    );
  };

  filterTodosData = (todosData) => {
    const { screen } = this.props;

    switch (screen) {
      case CONSTANTS.ALL:
      return todosData;
      case CONSTANTS.ACTIVE:
      return todosData.filter(todo => !todo.completed);
      case CONSTANTS.COMPLETED:
      return todosData.filter(todo => todo.completed);
    }

    return todosData;
  };

  render() {
    return (
      <View style={styles.container}>
        <Header />
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ScrollView>
          <ReactiveList
            componentId="ReactiveList"
            defaultQuery={() => ({
              query: {
                match_all: {},
              },
            })}
            stream
            onAllData={this.onAllData}
            dataField="title"
            showResultStats={false}
            pagination={false}
          />
          {this.state.addingTodo ? (
            <View style={styles.row}>
              <AddTodo
                onAdd={(todo) => {
                  this.setState({ addingTodo: false });
                  this.api.add(todo);
                }}
                onCancelDelete={() => this.setState({ addingTodo: false })}
                onBlur={() => this.setState({ addingTodo: false })}
              />
            </View>
          ) : null}
        </ScrollView>
        <AddTodoButton onPress={()=> this.setState({ addingTodo: true })} />
      </View>
    );
  }
}
