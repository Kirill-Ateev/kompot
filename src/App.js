import "./App.css";
import React, { useState } from "react";
import Markov from "markov-strings";
import nGram from "n-gram";
import { Button, Container, TextField, Typography } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";
import sampleSize from "lodash.samplesize";

const useStyles = makeStyles((theme) => ({
  btn: {
    background: "#ba0000",
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  fields: {
    width: "33.3%",
    marginBottom: theme.spacing(1),
    "& label.Mui-focused": {
      color: "#ba0000",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#ba0000",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "silver",
      },
      "&:hover fieldset": {
        borderColor: "#ba0000",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ba0000",
      },
    },
  },
}));

function App() {
  const [data, setData] = useState([]);
  const [result, setResult] = useState("");
  const [markov, setMarkov] = useState(null);
  const [btn, setBtn] = useState(false);
  const [files, setFiles] = useState([]);
  const [load, setLoad] = useState(false);
  const [values, setValues] = useState({
    numberOfLines: 5,
    stateSize: 5,
    nGrams: 2,
  });
  const classes = useStyles();

  const onChangeInputHandler = (event) => {
    if (event.target.files[0]) {
      setFiles(event.target.files);

      let reader = new FileReader();

      reader.readAsText(event.target.files[0]);

      reader.onprogress = function () {
        setLoad(true);
      };

      reader.onload = function () {
        setData(reader.result);
        setLoad(false);
        setBtn(true);
      };

      reader.onerror = function () {
        console.log(reader.error);
      };
    }
  };

  const onUploadHandler = () => {
    // Build the Markov generator
    const markov = new Markov({ stateSize: values.stateSize });

    let parts = nGram(values.nGrams)(
      data
        .split(/[,]|[.]|[\r\n]+/g)
        .filter((x) => x !== "" && x !== " ")
    ).map((i) => i.join(" ").trim());

   
    // Add data for the generator
    markov.addData(sampleSize(parts, parts.length - (parts.length * values.nGrams) / 100));

    setMarkov(markov);
  };

  const generate = () => {
    let result = "";

    try {
      const options = {
        maxTries: 300, // Give up if I don't have a sentence after 20 tries (default is 10)
        // You'll often need to manually filter raw results to get something that fits your needs.
        filter: (result) => {
          return result;
        },
      };

      // Generate a sentence
      for (let i = 0; i < values.numberOfLines; i++) {
        result = result + "\n" + markov.generate(options).string;
      }
      setResult(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleValueChange = (event, name) => {
    setValues({ ...values, [name]: Number(event.target.value) });
  };

  const renderTextField = (name, label) => {
    return (
      <TextField
        type="number"
        value={values[name]}
        InputProps={{ inputProps: { min: 0, max: 10 } }}
        className={classes.fields}
        id="outlined-basic"
        onChange={(event) => handleValueChange(event, name)}
        label={label}
        variant="outlined"
      />
    );
  };

  const renderButton = (text, func) => {
    return (
      <Button
        className={classes.btn}
        variant="contained"
        color="secondary"
        disabled={!btn}
        onClick={func}
      >
        {text}
      </Button>
    );
  };

  return (
    <>
      {load && <LinearProgress color="secondary" />}
      <Container className="app" maxWidth="sm">
        {/* TODO: add on drag events */}
        <div className="fileInput">
          <div className="form-group">
            <label className="label">
              <span className="title">
                {files[0] ? files[0].name : "ADD TEXT FILE"}
              </span>
              <input
                type="file"
                accept="text/plain"
                onChange={onChangeInputHandler}
              />
            </label>
          </div>
        </div>

        <span data-tooltip="Number of lines in the generated text">
          {renderTextField("numberOfLines", "Number of lines")}
        </span>
        <span data-tooltip="A parameter that adjusts the connectivity between the generated parts of the text">
        {renderTextField("stateSize", "State size")}
        </span>

      {/* TODO: add poppers with hints */}
        {renderTextField("nGrams", "N-grams")}

        <div data-tooltip="Tokenizing the loaded .txt dataset">
        {renderButton("Tokenization", onUploadHandler)}
        </div>
        {renderButton("Generate", generate)}

        <Typography>{result}</Typography>
      </Container>
    </>
  );
}

export default App;
