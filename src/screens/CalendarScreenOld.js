import React, {useState} from "react"
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput} from "react-native";
import {Modal} from "react-native"

export default function Calendar()
{
  
  var startOffset = 6; // value between 0-6 (6 means the month starts on a Sunday)
  // later changed to a dynamic variable

  const now   = new Date();
  const day   = now.getDate()
  const month = now.getMonth();
  const year  = now.getFullYear();

  var numDaysInMonth = 0;
  if (month == 0  ||
    month == 2  ||
    month == 4  ||
    month == 6  ||
    month == 7  ||
    month == 9 ||
    month == 11)
  numDaysInMonth = 31;
  else if (month == 2) numDaysInMonth = 28;
  else numDaysInMonth = 30;

  function monthName(index) {
      switch (index) {
      case 0:
        return "Janurary";
      case 1:
        return "Feburary";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
    }
  }

  // ===== Calendar Items =====
  const cells = [];
  // all calendar boxes before the startOffset date
  for (let i = 0; i < startOffset; i++) cells.push(null);

  // fill all calendar boxes in the month
  for (let i = 1; i <= numDaysInMonth; i++) cells.push(i);

  // fill all remaining calendar boxes with "null"
  // 42 == 7x6 (a week has 7 days, maximum 6 weeks per month)
  while (cells.length < 42) cells.push(null);


  // Store selected date
  


  // ===== List Items =====
  const deadlines = [
    { id: 0, title: "Test 1", description: "This is some sample text" },
    { id: 1, title: "Test 2", description: "This is some sample text" },
    { id: 2, title: "Test 3", description: "This is some sample text" },
    { id: 3, title: "Test 4", description: "This is some sample text" },
  ];

  

  // ===== UI Buttons =====
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.monthText}>
          {monthName(month)}
        </Text>
      </View>

      <View style={styles.topLeft}>
        <Text style={[styles.prevMonthText]}>
          Prev
        </Text>
      </View>

      <View style={styles.topRight}>
        <Text style={[styles.prevMonthText]}>
          Next
        </Text>
      </View>

      <View style={styles.calendar}>
        {cells.map((day, index) => (
          <View key={index} style={styles.day}>
            {day && <Text>{day}</Text>}
          </View>
        ))}
      </View>

      <ScrollView style={styles.cardList}>
        {deadlines.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.circleButtonBlue, styles.bottomRight]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[{color: 'white'}, styles.uiText]}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>New Event</Text>

            <TouchableOpacity
              style={[styles.tile]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[{color: 'white'}, styles.uiTextSmallLeft]}>Event Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tile]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[{color: 'white'}, styles.uiTextSmallLeft]}>Description</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleButtonRed, styles.bottomRight]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[{color: 'white'}, styles.uiText]}>x</Text>
            </TouchableOpacity>
            
          </View>
        </View>

      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },

  header: {
    marginBottom: 10
  },

  monthText: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  prevMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  calendar: {
    width: '95%',
    aspectRatio: 1.2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  day: {
    width: '14.28571429%',
    height: '16.66666667%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },

  card: {
    width: '100%',
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#E5C46E'
  },

  tile: {
    width: '100%',
    height: '10%',
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4a62e5'
  },

  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },

  circleButtonBlue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center'
  },

  circleButtonRed: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e24a4a',
    justifyContent: 'center',
    alignItems: 'center'
  },

  bottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },

  topLeft: {
    position: 'absolute',
    top: 15,
    left: 7.5
  },

  topRight: {
    position: 'absolute',
    top: 15,
    right: 7.5
  },

  uiText: {
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  uiTextSmall: {
    fontWeight: 'regular',
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  uiTextSmallLeft: {
    fontWeight: 'regular',
    fontSize: 18,
    textAlign: 'left',
    textAlignVertical: 'center',
  },

  cardList: {
    width: '95%',
    marginTop: 10,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalCard: {
    width: '100%',
    height: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white'
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },

  marginTop: {
    marginTop: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10
  },

  today: {
    backgroundColor: 'red'
  },

  todayText: {
    color: 'white'
  },

  selected: {
    backgroundColor: '#4A90E2'
  },

  selectedText: {
    color: 'white'
  }

})