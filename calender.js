var CalenderApp = React.createClass({
	
	createNewEvent: function(eventObj) {
		this.setState({
			showCreateModal: false
		});
		if (!eventObj) {
			return;
		}
		// add an event to the events var
		var id = Date.now(); // use timestamp as id
		this.events[id] = eventObj;
		
		// update the hours state
		this.updateHoursHash(id);
	},
	
	deleteEvent: function(eventObj) {
		// when you delete make sure to change the state of slots. 
	},
	findSlot: function(hour, start) {
		if (!hour) { // nothing for that hour at all
			return 0;
		}
		var slot = -1;
		for (var i = start; i<5; i++) {// max 5 assuming
			if (!hour[i]) {
				slot = i;
				break;
			}
		}
		return slot;
	},
	
	updateHoursHash: function(id) {
		var event = this.events[id];
		if (!event) {
			return false;
		}
		var hours = this.state.hours;
		
		// find a good slot
		var slotCandidate = 0;
		var finalSlot = -1;
		for (var slotCandidate = 0; slotCandidate <5; slotCandidate++) {
			var valid = true;
			for (var hourI = event.startTime; hourI <  event.endTime; hourI++) {
				if (hours[hourI] && hours[hourI][slotCandidate]) {
					// slotCandidate already occupied
					valid = false;
					break;
				}
			}
			if (valid) { // slotCandidate is valid
				finalSlot = slotCandidate;
				break;
			}
		}

		if (finalSlot < 0) {
			// TODO sorry cant do
			// remove from events
			console.log('calender Error: no more slpts available', event);
			this.events[id] = null;
			
			//TODO open the dialog again?
			return false;
		}
		
		// update the hours obj
		for (var hourI = event.startTime; hourI <  event.endTime; hourI++) {
			if (!hours[hourI]) {
				hours[hourI] = {};
			}
			hours[hourI][finalSlot] = id;
		}
		
		this.setState({
			hours: hours
		});
	},
	
	getInitialState: function() {			
		// blank set
		/*
		return {
			hours : {} 
		};
		*/
		
		// hardcoded values: 
		this.events = { // we just want a list of events as a var. Dont want this as state. We can dirty the events later on or remove from the list
			id1: {
				name: 'meeting1', 
				desc: 'let us meet', 
				startTime: 1, // should use tiemstamp later
				endTime: 2					
			}, 
			id2: {
				name: 'meeting2', 
				desc: 'let us meet', 
				startTime: 2, // should use tiemstamp later
				endTime: 3					
			}, 				
			id3: {
				name: 'meeting3', 
				desc: 'let us meet', 
				startTime: 1, // should use tiemstamp later
				endTime: 3					
			}, 				
			id4: {
				name: 'meeting4', 
				desc: 'let us meet', 
				startTime: 5, // should use tiemstamp later
				endTime: 6					
			}
		}
		
		// create the hours
		
		// hash of hour based events?
		
		// hardcoded // TODO get it from the local storage? // maybe later we can use some mongodb kinda thing to store?. Would need the whole flux set up
		
		// Assumptions 1. events are in the quantum of 1 hour. 2. Only 5 events overlap for an hour 3. Only 1 day
		return {
			showCreateModal: false,
			hours: { // list of events along with thr slot within the 
				0 : {
					
				}, 
				1 : {
					0: "id1",
					1: "id3"
				},
				2 : {
					0: "id2",
					1: "id3"
				},
				3 : {
				},
				5 : {
					0: "id4"
				}
			}				
		}
	},		
	getIndividualHourMarkup: function(eventsThisHour) {
		var slots = [];
		var eventid;
		for (var slot=0; slot<5; slot++) {
			eventid = eventsThisHour && eventsThisHour[slot];
			if (eventid && this.events[eventid]) {
				slots.push(<div className='col-xs-2 filled'> {this.events[eventid].name}</div>);
			} else {
				slots.push(<div className='col-xs-2'></div>);
			}
		}
		return slots;		
	},
	
	getCalenderMarkup : function() {
		debugger
		var hours = this.state.hours;
		var hoursMarkup = [];
		for (var i =0; i<24; i++) {
			var indHourMarkup = this.getIndividualHourMarkup(hours[i]);
			hoursMarkup.push(
				<div className='row' onClick={this.handleCreateClick}>
					<div className='col-xs-2'>{'Hour: ' + i}</div>
					{indHourMarkup}
				</div>
			);
		} 	
		return hoursMarkup;	
	},
	handleCreateClick: function() {
		this.setState({
			showCreateModal: true
		});
	},
	getCreateModalMarkup: function() {
		return (
			<CreateCalenderModal onDone={this.createNewEvent}/>
		)
	},
	render: function() {
		var calender = this.getCalenderMarkup();
		var showCreateModal = this.state.showCreateModal ? this.getCreateModalMarkup(): null;
		return (
			<div className={this.state.showCreateModal? 'modal-open': 'modal-closed'}>
				<h1 className=''>Today</h1>
				{showCreateModal}
				<div className='todayHours'> 
				    {calender}
				</div>
			</div>
		);
	}	
});

var CreateCalenderModal = React.createClass({
	onDoneClick: function() {
		var onDone = this.props.onDone;
		// take start time as prop
		// eventObj get value from the dom
		// make sure end? start time
		var eventObj = {
				name: document.getElementById('eventName').value,
				desc: document.getElementById('description').value, 
				startTime: parseInt(document.getElementById('timestart').value), // should use tiemstamp later
				endTime: parseInt(document.getElementById('timeend').value)			
		};
		onDone(eventObj);
	},
	onCancelClick: function() {
		var onDone = this.props.onDone;
		onDone(null);
	},
	render: function() {
		return (
			<div className='inner-modal'>
				<div className='createDialog'>
					Create new Meeting
					<div className='row'><div className='col-xs-6'>Name:</div> <input id='eventName' className='col-xs-6' type='text' placeholder='EventName'/></div>
					<div className='row'><div className='col-xs-6'>Description:</div> <input id='description' className='col-xs-6' type='text' placeholder='Desription'/></div>
					<div className='row'><div className='col-xs-6'>Start Hour:</div> <input id='timestart' className='col-xs-6' type='number' placeholder='9' min='0' max='23'/></div>
					<div className='row'><div className='col-xs-6'>End Hour:</div> <input id='timeend' className='col-xs-6' type='number' min='0'  placeholder='9' max='23'/></div>
					<div className='row'><div className='col-xs-6'> <div className='btn btn-primary' onClick={this.onDoneClick}> Done</div></div><div className='col-xs-6'> <div className='btn btn-primary' onClick={this.onCancelClick}> Cancel</div></div></div>
				</div>
			</div>
		)
	}
	
});

ReactDOM.render(<CalenderApp/>, document.getElementById('calenderAppContainer'));