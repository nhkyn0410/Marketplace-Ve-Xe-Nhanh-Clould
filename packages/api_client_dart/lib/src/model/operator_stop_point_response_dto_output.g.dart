// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operator_stop_point_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OperatorStopPointResponseDtoOutputTypeEnum
    _$operatorStopPointResponseDtoOutputTypeEnum_BUS_STATION =
    const OperatorStopPointResponseDtoOutputTypeEnum._('BUS_STATION');
const OperatorStopPointResponseDtoOutputTypeEnum
    _$operatorStopPointResponseDtoOutputTypeEnum_OFFICE =
    const OperatorStopPointResponseDtoOutputTypeEnum._('OFFICE');
const OperatorStopPointResponseDtoOutputTypeEnum
    _$operatorStopPointResponseDtoOutputTypeEnum_REST_STOP =
    const OperatorStopPointResponseDtoOutputTypeEnum._('REST_STOP');
const OperatorStopPointResponseDtoOutputTypeEnum
    _$operatorStopPointResponseDtoOutputTypeEnum_PICKUP_POINT =
    const OperatorStopPointResponseDtoOutputTypeEnum._('PICKUP_POINT');

OperatorStopPointResponseDtoOutputTypeEnum
    _$operatorStopPointResponseDtoOutputTypeEnumValueOf(String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$operatorStopPointResponseDtoOutputTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$operatorStopPointResponseDtoOutputTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$operatorStopPointResponseDtoOutputTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$operatorStopPointResponseDtoOutputTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointResponseDtoOutputTypeEnum>
    _$operatorStopPointResponseDtoOutputTypeEnumValues = BuiltSet<
        OperatorStopPointResponseDtoOutputTypeEnum>(const <OperatorStopPointResponseDtoOutputTypeEnum>[
  _$operatorStopPointResponseDtoOutputTypeEnum_BUS_STATION,
  _$operatorStopPointResponseDtoOutputTypeEnum_OFFICE,
  _$operatorStopPointResponseDtoOutputTypeEnum_REST_STOP,
  _$operatorStopPointResponseDtoOutputTypeEnum_PICKUP_POINT,
]);

const OperatorStopPointResponseDtoOutputStatusEnum
    _$operatorStopPointResponseDtoOutputStatusEnum_ACTIVE =
    const OperatorStopPointResponseDtoOutputStatusEnum._('ACTIVE');
const OperatorStopPointResponseDtoOutputStatusEnum
    _$operatorStopPointResponseDtoOutputStatusEnum_INACTIVE =
    const OperatorStopPointResponseDtoOutputStatusEnum._('INACTIVE');

OperatorStopPointResponseDtoOutputStatusEnum
    _$operatorStopPointResponseDtoOutputStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$operatorStopPointResponseDtoOutputStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$operatorStopPointResponseDtoOutputStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointResponseDtoOutputStatusEnum>
    _$operatorStopPointResponseDtoOutputStatusEnumValues = BuiltSet<
        OperatorStopPointResponseDtoOutputStatusEnum>(const <OperatorStopPointResponseDtoOutputStatusEnum>[
  _$operatorStopPointResponseDtoOutputStatusEnum_ACTIVE,
  _$operatorStopPointResponseDtoOutputStatusEnum_INACTIVE,
]);

Serializer<OperatorStopPointResponseDtoOutputTypeEnum>
    _$operatorStopPointResponseDtoOutputTypeEnumSerializer =
    _$OperatorStopPointResponseDtoOutputTypeEnumSerializer();
Serializer<OperatorStopPointResponseDtoOutputStatusEnum>
    _$operatorStopPointResponseDtoOutputStatusEnumSerializer =
    _$OperatorStopPointResponseDtoOutputStatusEnumSerializer();

class _$OperatorStopPointResponseDtoOutputTypeEnumSerializer
    implements PrimitiveSerializer<OperatorStopPointResponseDtoOutputTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OperatorStopPointResponseDtoOutputTypeEnum
  ];
  @override
  final String wireName = 'OperatorStopPointResponseDtoOutputTypeEnum';

  @override
  Object serialize(Serializers serializers,
          OperatorStopPointResponseDtoOutputTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointResponseDtoOutputTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointResponseDtoOutputTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointResponseDtoOutputStatusEnumSerializer
    implements
        PrimitiveSerializer<OperatorStopPointResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OperatorStopPointResponseDtoOutputStatusEnum
  ];
  @override
  final String wireName = 'OperatorStopPointResponseDtoOutputStatusEnum';

  @override
  Object serialize(Serializers serializers,
          OperatorStopPointResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointResponseDtoOutput
    extends OperatorStopPointResponseDtoOutput {
  @override
  final String id;
  @override
  final String name;
  @override
  final OperatorStopPointResponseDtoOutputTypeEnum type;
  @override
  final String address;
  @override
  final String provinceId;
  @override
  final String wardId;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? description;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final OperatorStopPointResponseDtoOutputStatusEnum status;

  factory _$OperatorStopPointResponseDtoOutput(
          [void Function(OperatorStopPointResponseDtoOutputBuilder)?
              updates]) =>
      (OperatorStopPointResponseDtoOutputBuilder()..update(updates))._build();

  _$OperatorStopPointResponseDtoOutput._(
      {required this.id,
      required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description,
      required this.createdAt,
      required this.updatedAt,
      required this.status})
      : super._();
  @override
  OperatorStopPointResponseDtoOutput rebuild(
          void Function(OperatorStopPointResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OperatorStopPointResponseDtoOutputBuilder toBuilder() =>
      OperatorStopPointResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperatorStopPointResponseDtoOutput &&
        id == other.id &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OperatorStopPointResponseDtoOutput')
          ..add('id', id)
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('status', status))
        .toString();
  }
}

class OperatorStopPointResponseDtoOutputBuilder
    implements
        Builder<OperatorStopPointResponseDtoOutput,
            OperatorStopPointResponseDtoOutputBuilder> {
  _$OperatorStopPointResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  OperatorStopPointResponseDtoOutputTypeEnum? _type;
  OperatorStopPointResponseDtoOutputTypeEnum? get type => _$this._type;
  set type(OperatorStopPointResponseDtoOutputTypeEnum? type) =>
      _$this._type = type;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  String? _wardId;
  String? get wardId => _$this._wardId;
  set wardId(String? wardId) => _$this._wardId = wardId;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  OperatorStopPointResponseDtoOutputStatusEnum? _status;
  OperatorStopPointResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(OperatorStopPointResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  OperatorStopPointResponseDtoOutputBuilder() {
    OperatorStopPointResponseDtoOutput._defaults(this);
  }

  OperatorStopPointResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperatorStopPointResponseDtoOutput other) {
    _$v = other as _$OperatorStopPointResponseDtoOutput;
  }

  @override
  void update(
      void Function(OperatorStopPointResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperatorStopPointResponseDtoOutput build() => _build();

  _$OperatorStopPointResponseDtoOutput _build() {
    final _$result = _$v ??
        _$OperatorStopPointResponseDtoOutput._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'OperatorStopPointResponseDtoOutput', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'OperatorStopPointResponseDtoOutput', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'OperatorStopPointResponseDtoOutput', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'OperatorStopPointResponseDtoOutput', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId, r'OperatorStopPointResponseDtoOutput', 'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(
              wardId, r'OperatorStopPointResponseDtoOutput', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(
              latitude, r'OperatorStopPointResponseDtoOutput', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(
              longitude, r'OperatorStopPointResponseDtoOutput', 'longitude'),
          description: description,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'OperatorStopPointResponseDtoOutput', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'OperatorStopPointResponseDtoOutput', 'updatedAt'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'OperatorStopPointResponseDtoOutput', 'status'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
