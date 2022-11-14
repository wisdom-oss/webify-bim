CREATE SCHEMA IF NOT EXISTS bim_models;

CREATE TABLE IF NOT EXISTS bim_models.models (
    -- name of the model
    name varchar NOT NULL,
    -- optional description of the model
    description varchar,
    -- model id
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);

CREATE TABLE IF NOT EXISTS bim_models.files (
    -- file id
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    -- model this file belongs to
    model uuid REFERENCES bim_models.models,
    -- original file name
    name varchar(255) NOT NULL,
    -- hash of original file
    hash char(${hash_length}) NOT NULL,
    -- path of wexbim file
    wexbim varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS bim_models.instances (
    -- model this instance belongs to
    model uuid REFERENCES bim_models.models,
    -- file this instance belongs
    file uuid REFERENCES bim_models.files,
    -- ifc data type
    data_type varchar NOT NULL,
    -- ifc instance id (not the primary key)
    id integer NOT NULL,
    -- the json data of the instance
    data json NOT NULL,
    -- the pair of the id in a file is unique
    PRIMARY KEY (file, id)
);
