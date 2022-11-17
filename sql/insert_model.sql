INSERT INTO bim_models.models (name, description)
VALUES (${name}, ${description})
RETURNING id
