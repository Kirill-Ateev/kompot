import "./App.css";
import React, { useState } from "react";
import Markov from "markov-strings";
import nGram from 'n-gram';

function App() {
  const [data, setData] = useState("");
  const [result, setResult] = useState("");
  const [markov, setMarkov] = useState(null);

  const onChangeHandler = (event) => {
    console.log(event.target.files[0]);
    if (event.target.files[0]) {
      let reader = new FileReader();

      reader.readAsText(event.target.files[0]);

      reader.onload = function () {
        console.log(nGram(3)(reader.result.split(/[ ]|[.]|[\r\n]+/g).filter(x => x !== '' && x !== ' ')).map(i => i.join(' ').trim()));
        setData(nGram(4)(reader.result.split(/[.]|[\r\n]+/g).filter(x => x !== '' && x !== ' ')).map(i => i.join(' ').trim()));
      };

      reader.onerror = function () {
        console.log(reader.error);
      };
    }
  };

  const onClickHandler = () => {
    // Build the Markov generator
    const markov = new Markov({ stateSize: 3 });

    // Add data for the generator
    markov.addData(data);
    setMarkov(markov);
  };

  const generate = () => {
    let result = "";

    const options = {
      maxTries: 30, // Give up if I don't have a sentence after 20 tries (default is 10)

      // You'll often need to manually filter raw results to get something that fits your needs.
      filter: (result) => {
        return result; // End sentences with a dot.
      },
    };

    // Generate a sentence
    for (let i = 0; i < 5; i++) {
      result = result +"\n"+ markov.generate(options).string;
    }
    console.log(result);
    setResult(result);
  };

  return (
    <div className="App">
      <input
        type="file"
        accept="text/plain"
        name="file"
        onChange={onChangeHandler}
      />
      <button onClick={onClickHandler}>Upload</button>
      <button onClick={generate}>Generate</button>
      <div>STRING</div>
      <div>{result}</div>
      {/* REFS
      <div>{result.refs.map((a) => `(${Object.values(a)})`).join(", ")}</div> */}
    </div>
  );
}

export default App;
