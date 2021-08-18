import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import Realm from 'realm';

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
  return (
    <View style={styles.screen}>
      <View style={styles.form}>
        <TextInput style={styles.textInput} placeholder="Task name to add" />
        <Pressable style={styles.submit}>
          <Text style={styles.icon}>
            ＋
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2A3642'
  },
  form: {
    flexDirection: 'row',
    marginTop: 60,
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
  }
});