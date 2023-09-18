# 18/09/2023

Changement important au niveau du menu de gauche.
Je supprime l'idée de générer un men issu d'un groupe de features.
Je voulais au départ faire un menu où, lors du clic, afficher les feature sur la carte.
Mais c'est bordelique avec déjà les hover sur les éléments sur la carte.

Cela générait un json comme ça :

```
{
  "title": "Plan organisateurs spectacle",
  "steps": [
    {
      "step_title": "Pour les artistes",
      "step_title_top": "Brest Arena pour vos spectacles",
      "step_mapconfig": {
        "center": [-4.519889705059086, 48.38735432101723],
        "level": -1,
        "duration": 2000,
        "zoom": 18.5
      },
      "step_features": [
        {
          "features": [4507, 4511, 4508, 4510],
          "features_title": "Loges niveau -1"
        },
        { "features": [4529], "features_title": "Loge rapide niveau -2" },
        { "features": [4875], "features_title": "Zone de chargement" },
        { "features": [4525], "features_title": "Restauration" }
      ]
    },
    {
      "step_title": "Pour les spectateurs",
      "step_title_top": "Brest Arena pour vos spectacles",
      "step_mapconfig": {
        "center": [-4.519889705059086, 48.38735432101723],
        "level": 0,
        "duration": 2000,
        "zoom": 19
      },
      "step_features": [
        { "features": [4522], "features_title": "Espace de restauration" }
      ]
    },
```
Le json d'ACF : 

```
[
    {
        "key": "group_650364207fb65",
        "title": "Map",
        "fields": [
            {
                "key": "field_65036838b9606",
                "label": "Plan page",
                "name": "map_step",
                "aria-label": "",
                "type": "repeater",
                "instructions": "",
                "required": 0,
                "conditional_logic": 0,
                "wrapper": {
                    "width": "",
                    "class": "",
                    "id": ""
                },
                "layout": "row",
                "pagination": 0,
                "min": 0,
                "max": 0,
                "collapsed": "",
                "button_label": "Ajouter un élément",
                "rows_per_page": 20,
                "sub_fields": [
                    {
                        "key": "field_65036540708a8",
                        "label": "Sur-titre",
                        "name": "title-top",
                        "aria-label": "",
                        "type": "text",
                        "instructions": "",
                        "required": 0,
                        "conditional_logic": 0,
                        "wrapper": {
                            "width": "",
                            "class": "",
                            "id": ""
                        },
                        "default_value": "",
                        "maxlength": "",
                        "placeholder": "",
                        "prepend": "",
                        "append": "",
                        "parent_repeater": "field_65036838b9606"
                    },
                    {
                        "key": "field_65036420708a7",
                        "label": "Titre",
                        "name": "title",
                        "aria-label": "",
                        "type": "text",
                        "instructions": "",
                        "required": 0,
                        "conditional_logic": 0,
                        "wrapper": {
                            "width": "",
                            "class": "",
                            "id": ""
                        },
                        "default_value": "",
                        "maxlength": "",
                        "placeholder": "",
                        "prepend": "",
                        "append": "",
                        "parent_repeater": "field_65036838b9606"
                    },
                    {
                        "key": "field_6503654f708a9",
                        "label": "Espaces",
                        "name": "features",
                        "aria-label": "",
                        "type": "repeater",
                        "instructions": "",
                        "required": 0,
                        "conditional_logic": 0,
                        "wrapper": {
                            "width": "",
                            "class": "",
                            "id": ""
                        },
                        "layout": "table",
                        "pagination": 0,
                        "min": 0,
                        "max": 0,
                        "collapsed": "",
                        "button_label": "Ajouter un élément",
                        "rows_per_page": 20,
                        "sub_fields": [
                            {
                                "key": "field_650366d1708aa",
                                "label": "Espace",
                                "name": "feature",
                                "aria-label": "",
                                "type": "relationship",
                                "instructions": "",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "post_type": [
                                    "map-feature"
                                ],
                                "post_status": "",
                                "taxonomy": "",
                                "filters": [
                                    "search",
                                    "post_type",
                                    "taxonomy"
                                ],
                                "return_format": "id",
                                "min": "",
                                "max": "",
                                "elements": "",
                                "parent_repeater": "field_6503654f708a9"
                            },
                            {
                                "key": "field_65045aaca4fd6",
                                "label": "Nom des espaces",
                                "name": "name_spaces",
                                "aria-label": "",
                                "type": "text",
                                "instructions": "",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "default_value": "",
                                "maxlength": "",
                                "placeholder": "",
                                "prepend": "",
                                "append": "",
                                "parent_repeater": "field_6503654f708a9"
                            }
                        ],
                        "parent_repeater": "field_65036838b9606"
                    },
                    {
                        "key": "field_650561a4ee5df",
                        "label": "Configuration carte",
                        "name": "map_config",
                        "aria-label": "",
                        "type": "group",
                        "instructions": "",
                        "required": 0,
                        "conditional_logic": 0,
                        "wrapper": {
                            "width": "",
                            "class": "",
                            "id": ""
                        },
                        "layout": "block",
                        "sub_fields": [
                            {
                                "key": "field_65056202ee5e0",
                                "label": "Centre de la la carte",
                                "name": "center",
                                "aria-label": "",
                                "type": "text",
                                "instructions": "",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "default_value": "[-4.519889705059086, 48.38735432101723]",
                                "maxlength": "",
                                "placeholder": "",
                                "prepend": "",
                                "append": ""
                            },
                            {
                                "key": "field_65056238ee5e1",
                                "label": "Zoom",
                                "name": "zoom",
                                "aria-label": "",
                                "type": "number",
                                "instructions": "",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "default_value": "",
                                "min": "",
                                "max": "",
                                "placeholder": "",
                                "step": "",
                                "prepend": "",
                                "append": ""
                            },
                            {
                                "key": "field_65056258ee5e2",
                                "label": "Durée du déplacement de la carte",
                                "name": "duration",
                                "aria-label": "",
                                "type": "number",
                                "instructions": "En milliseconde (1s = 1000 ms)",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "default_value": 2000,
                                "min": "",
                                "max": "",
                                "placeholder": "",
                                "step": "",
                                "prepend": "",
                                "append": ""
                            },
                            {
                                "key": "field_6505629a768a9",
                                "label": "Niveau",
                                "name": "level",
                                "aria-label": "",
                                "type": "number",
                                "instructions": "",
                                "required": 0,
                                "conditional_logic": 0,
                                "wrapper": {
                                    "width": "",
                                    "class": "",
                                    "id": ""
                                },
                                "default_value": 0,
                                "min": "",
                                "max": "",
                                "placeholder": "",
                                "step": "",
                                "prepend": "",
                                "append": ""
                            }
                        ],
                        "parent_repeater": "field_65036838b9606"
                    }
                ]
            }
        ],
        "location": [
            [
                {
                    "param": "post_type",
                    "operator": "==",
                    "value": "map"
                }
            ]
        ],
        "menu_order": 0,
        "position": "normal",
        "style": "default",
        "label_placement": "top",
        "instruction_placement": "label",
        "hide_on_screen": "",
        "active": true,
        "description": "",
        "show_in_rest": 0
    },
    {
        "key": "group_6501c38c43931",
        "title": "Map features",
        "fields": [
            {
                "key": "field_6501d9572270e",
                "label": "Geometry",
                "name": "feature",
                "aria-label": "",
                "type": "json",
                "instructions": "",
                "required": 0,
                "conditional_logic": 0,
                "wrapper": {
                    "width": "",
                    "class": "",
                    "id": ""
                }
            },
            {
                "key": "field_650845c5c964e",
                "label": "Type",
                "name": "indoor",
                "aria-label": "",
                "type": "select",
                "instructions": "",
                "required": 0,
                "conditional_logic": 0,
                "wrapper": {
                    "width": "",
                    "class": "",
                    "id": ""
                },
                "choices": {
                    "room": "Pièce \/ Espace",
                    "area": "Grande zone",
                    "point": "Point d'intérêt"
                },
                "default_value": false,
                "return_format": "value",
                "multiple": 0,
                "allow_null": 0,
                "ui": 0,
                "ajax": 0,
                "placeholder": ""
            },
            {
                "key": "field_65086a167918c",
                "label": "Icone",
                "name": "maki",
                "aria-label": "",
                "type": "select",
                "instructions": "",
                "required": 0,
                "conditional_logic": [
                    [
                        {
                            "field": "field_650845c5c964e",
                            "operator": "==",
                            "value": "point"
                        }
                    ]
                ],
                "wrapper": {
                    "width": "",
                    "class": "",
                    "id": ""
                },
                "choices": {
                    "american-football": "Ballon de rugby",
                    "aquarium": "Aquarium"
                },
                "default_value": false,
                "return_format": "value",
                "multiple": 0,
                "allow_null": 0,
                "ui": 0,
                "ajax": 0,
                "placeholder": ""
            }
        ],
        "location": [
            [
                {
                    "param": "post_type",
                    "operator": "==",
                    "value": "post"
                }
            ],
            [
                {
                    "param": "post_type",
                    "operator": "==",
                    "value": "map-feature"
                }
            ]
        ],
        "menu_order": 0,
        "position": "acf_after_title",
        "style": "default",
        "label_placement": "top",
        "instruction_placement": "label",
        "hide_on_screen": "",
        "active": true,
        "description": "",
        "show_in_rest": 0
    }
]

```

