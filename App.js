import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import Realm from 'realm';
import openURLInBrowser from 'react-native/Libraries/Core/Devtools/openURLInBrowser';

import Task from './Task';

export default function App() {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const realmRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    openRealm();

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, []);

  const openRealm = () => {
    try {
      // Open a local realm file with the schemas
      const config = {
        schema: [Task.schema],
        // deleteRealmIfMigrationNeeded: true
      };

      const realm = new Realm(config);
      realmRef.current = realm;

      // When querying a realm to find objects (e.g. realm.objects('Tasks')) the result we get back
      // and the objects in it are "live" and will always reflect the latest state.
      const tasks = realm.objects('Task');
      if (tasks?.length)
        setTasks(tasks);

      // Live queries and objects emit notifications when something has changed that we can listen for.
      subscriptionRef.current = tasks;
      tasks.addListener((/*collection, changes*/) => {
        // If wanting to handle deletions, insertions, and modifications differently
        // you can access them through the two arguments. (Always handle them in the
        // following order: deletions, insertions, modifications)
        // e.g. changes.insertions.forEach((index) => console.log('Inserted task: ', collection[index]));

        // By querying the objects again, we get a new reference to the Result and triggers
        // a rerender by React. Setting the tasks to either 'tasks' or 'collection' (from the
        // argument) will not trigger a rerender since it is the same reference
        setTasks(realm.objects('Task'));
      });
    }
    catch (err) {
      console.error('Error opening realm: ', err.message);
    }
  };

  const closeRealm = () => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners();
    subscriptionRef.current = null;

    const realm = realmRef.current;
    // If having listeners on the realm itself, also remove them using:
    // realm?.removeAllListeners();
    realm?.close();
    realmRef.current = null;
    setTasks([]);
  };

  const handleAddTask = () => {
    if (!newTaskDescription)
      return;
    
    // Everything in the function passed to "realm.write" is a transaction and will
    // hence succeed or fail together. A transcation is the smallest unit of transfer
    // in Realm so we want to be mindful of how much we put into one single transaction
    // and split them up if appropriate (more commonly seen server side). Since clients
    // may occasionally be online during short time spans we want to increase the probability
    // of sync participants to successfully sync everything in the transaction, otherwise
    // no changes propagate and the transaction needs to start over when connectivity allows.
    const realm = realmRef.current;
    realm?.write(() => {
      realm?.create('Task', new Task({ description: newTaskDescription }));
    });

    setNewTaskDescription('');
  };

  const handleToggleTask = (task) => {
    const realm = realmRef.current;
    realm?.write(() => {
      // Normally when updating a record in a NoSQL or SQL database, we have to type
      // a statement that will later be interpreted and used as instructions for how
      // to update the record. But in RealmDB, the objects are "live" because they are
      // actually referencing the object's location in memory on the device (memory mapping).
      // So rather than typing a statement, we modify the object directly by changing
      // the property values. If the changes adhere to the schema, Realm will accept
      // this new version of the object and wherever this object is being referenced
      // locally will also see the changes "live".
      task.isComplete = !task.isComplete;
    });
  };

  const handleDeleteTask = (task) => {
    const realm = realmRef.current;
    realm?.write(() => {
      realm?.delete(task);
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.form}>
        <TextInput
          value={newTaskDescription}
          placeholder='Task name to add'
          onChangeText={setNewTaskDescription}
          autoCorrect={false}
          style={styles.textInput}
        />
        <Pressable
          onPress={handleAddTask}
          style={styles.submit}
        >
          <Text style={styles.icon}>
            ＋
          </Text>
        </Pressable>
      </View>
      {(tasks.length === 0)
        ? (
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              Welcome to the Realm React Native TypeScript Template
            </Text>
            <Text style={styles.paragraph}>
              Start adding a task at the form on top of the screen to see how they are created in Realm and update the UI. You can also change a task status or remove it from the tasks list.
            </Text>
            <Text style={styles.paragraph}>
              You can find more information about the React Native Realm SDK in:
            </Text>
            <Pressable onPress={() => openURLInBrowser('https://docs.mongodb.com/realm/sdk/react-native/')}>
              <Text style={[styles.paragraph, styles.link]}>
                docs.mongodb.com/realm/sdk/react-native
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.task}>
                  <Pressable
                    onPress={() => handleToggleTask(item)}
                    style={[styles.taskStatus, item.isComplete && styles.completedStatus]}
                  >
                    <Text style={[styles.icon, item.isComplete && styles.checkmark]}>
                      {item.isComplete ? '✓' : '◯'}
                    </Text>
                  </Pressable>
                  <View style={styles.taskDescriptionContainer}>
                    <Text style={styles.taskDescription} numberOfLines={1} >
                      {item.description}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteTask(item)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              )}
              style={styles.flatList}
            />
          </View>
        )
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

    // TODO: ADD FOR ANDROID
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
  flatList: {
    marginTop: 20
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
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 7,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.7,
    shadowRadius: 3
  },
  taskDescriptionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  taskDescription: {
    color: '#000000',
    fontSize: 15,
    paddingHorizontal: 10
  },
  taskStatus: {
    justifyContent: 'center',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: '#B5B5B5',
    width: 50,
    height: 50
  },
  completedStatus: {
    backgroundColor: '#6E60F9'
  },
  deleteButton: {
    justifyContent: 'center',
  },
  deleteText: {
    color: '#B5B5B5',
    marginHorizontal: 10,
    fontSize: 15
  },
  checkmark: {
    fontSize: 15
  }
});
