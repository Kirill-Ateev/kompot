import "./App.css";
import React, { useState } from "react";
import Markov from "markov-strings";
import nGram from "n-gram";
import { Button, Container, TextField, Typography } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";

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
  const [data, setData] = useState("");
  const [result, setResult] = useState("");
  const [markov, setMarkov] = useState(null);
  const [btn, setBtn] = useState(false);
  const [files, setFiles] = useState([]);
  const [load, setLoad] = useState(false);
  const [values, setValues] = useState({
    numberOfLines: 5,
    stateSize: 3,
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
        //console.log(nGram(2)(reader.result.split(/[ ]|[.]|[\r\n]+/g).filter(x => x !== '' && x !== ' ')).map(i => i.join(' ').trim()));
        setData(
          nGram(values.nGrams)(
            reader.result
              .split(/[.]|[\r\n]+/g)
              .filter((x) => x !== "" && x !== " ")
          ).map((i) => i.join(" ").trim())
        );
        setLoad(false);
        setBtn(true);
      };

      reader.onerror = function () {
        console.log(reader.error);
      };
    }
  };

  const onUploadHandler = () => {
    debugger
    // Build the Markov generator
    const markov = new Markov({ stateSize: values.stateSize });
    // Add data for the generator
    markov.addData(data);
    setMarkov(markov);
  };

  const generate = () => {
    let result = "";
    try {
      const options = {
        maxTries: 300, // Give up if I don't have a sentence after 20 tries (default is 10)
        // You'll often need to manually filter raw results to get something that fits your needs.
        filter: (result) => {
          return result; // Filter options
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
    setValues({ ...values, [name]: event.target.value });
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

  return (
    <>
      {load && <LinearProgress color="secondary" />}
      <Container className="app" maxWidth="sm">
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

        {renderTextField("numberOfLines", "Number of lines")}
        {renderTextField("stateSize", "State size")}
        {renderTextField("nGrams", "N-grams")}

        <Button
          className={classes.btn}
          variant="contained"
          color="secondary"
          disabled={!btn}
          onClick={onUploadHandler}
        >
          {" "}
          Upload
        </Button>
        <Button
          className={classes.btn}
          variant="contained"
          color="secondary"
          disabled={!btn}
          onClick={generate}
        >
          Generate
        </Button>

        <Typography>{result}</Typography>
      </Container>
    </>
  );
}

export default App;
