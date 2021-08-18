import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import Realm from 'realm';
import openURLInBrowser from 'react-native/Libraries/Core/Devtools/openURLInBrowser';
class Task {
  constructor({ id = new Realm.BSON.ObjectId(), description, isComplete = false }) {
    this._id = id;
    this.description = description;

    if (isComplete)
      this.isComplete = isComplete;
  }

  static schema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      description: 'string',
      isComplete: { type: 'bool', default: false }
    }
  };
}

const configuration = {
  schema: [Task.schema],
  // deleteRealmIfMigrationNeeded: true,
};

const realm = new Realm(configuration);

export default function App() {

  const [text, setText] = useState('');
  const [tasks, setTasks] = useState([]);
  const handleAddTask = () => {
    if (text === '')
      return;

    setTasks([...tasks, { id: tasks.length, description: text, isComplete: false }]);
    setText('');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.form}>
        <TextInput style={styles.textInput} placeholder="Task name to add" onChangeText={setText} value={text} autoCorrect={false} />
        <Pressable style={styles.submit} onPress={handleAddTask}>
          <Text style={styles.icon}>
            ＋
          </Text>
        </Pressable>
      </View>
      {tasks.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Welcome to the Realm React Native TypeScript Template
          </Text>
          <Text style={styles.paragraph}>
            Start adding Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <Text style={styles.paragraph}>
            You can find more information about the React Native Realm SDK in:
          </Text>
          <Pressable onPress={() => openURLInBrowser('https://docs.mongodb.com/realm/sdk/react-native/')}>
            <Text style={[styles.paragraph, styles.link]}>
              docs.mongodb.com/realm/sdk/react-native
            </Text>
          </Pressable>
        </View>) :
        (<View style={styles.content}>
          <FlatList
            data={tasks}
            keyExtractor={task => task.id}
            renderItem={({ item }) => (
              <View style={styles.task}>
                <Pressable style={styles.submit2} onPress={handleAddTask}>
                  <Text style={styles.icon2}>
                    ＋
                  </Text>
                </Pressable>
                <Text style={styles.taskDescription}>
                  {item.description}
                </Text>
                <Pressable style={styles.submit3} onPress={handleAddTask}>
                  <Text style={styles.icon3}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>)
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2A3642'
  },
  form: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.7,
    shadowRadius: 3
  },
  textInput: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  submit: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    borderRadius: 5,
    backgroundColor: '#6E60F9',
    width: 50,
    height: 50
  },
  icon: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 10
  },
  link: {
    color: '#6E60F9',
    fontWeight: 'bold'
  },
  task: {
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  taskDescription: {
    flex: 1,
    color: '#000000',
    fontSize: 15,
  }
});