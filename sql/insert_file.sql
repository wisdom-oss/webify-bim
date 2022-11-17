INSERT INTO bim_models.files (model, name, hash)
VALUES (${model}, ${name}, ${hash})
RETURNING id
