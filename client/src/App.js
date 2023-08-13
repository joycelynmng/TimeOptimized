import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import './CustomDateTimePicker.css';
import { useState } from 'react';

function App() {
  // these will hold the start and end dates
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState(new Date());
  const [ eventDescription, setEventDescription ] = useState(new Date());

  const session = useSession(); // tokens
  const supabase = useSupabaseClient(); // talk to supabase
  const { isLoading } = useSessionContext();

  // if it is loading it will return an empty application
  if (isLoading) {
    return <></>
  }
  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });

    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error)
    }
  } 

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function createCalenderEvent() {
    console.log("Creating calendar event");
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(), // Date.toIsoString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los Angeles (will get your time zone)
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toIsoString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los Angeles (will get your time zone)
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + session.provider_token // Access token for google
      }, 
      body: JSON.stringify(event)
      // process the data once it is finally done (will give data from the request ex. if there was an error)
    }).then((data) => {
      // takes data and makes it into json format to turn into js object
      return data.json();
    }).then((data => {
      console.log(data);
      alert("Event created, check your Google Calendar!")
    }))
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);


  return (
    <div className="App">
      <div style={{width: "400px", margin: "30px auto"}}>
        {session ?
          // have user
          <>
            <h2>Welcome back {session.user.email}</h2>
            <p>Start of your event</p>
              <DateTimePicker onChange={setStart} value={start} />
            <p>End of your event</p>
              <DateTimePicker onChange={setEnd} value={end} />
            <p>Event name</p>
              <input type="text" onChange={(e) => setEventName(e.target.value)} />
            <p>Event Description</p>
              <input type="text" onChange={(e) => setEventDescription(e.target.value)} />
            <hr />
            <button onClick={() => createCalenderEvent()}>Create Calendar Event</button>
            <p></p>

            <button onClick = {() => signOut()}>Sign Out</button>
          </>
          // don't have user
          :
          <>
            <button onClick = {() => googleSignIn()}>Sign In With Google</button>
          </>
        }
      </div>
    </div>
  );
}

export default App;
