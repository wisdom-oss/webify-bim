INSERT INTO bim_models.files (model, name, hash, wexbim)
VALUES (${model}, ${name}, ${hash}, ${wexbim})
RETURNING id
