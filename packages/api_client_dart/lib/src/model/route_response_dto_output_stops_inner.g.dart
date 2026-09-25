// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_response_dto_output_stops_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RouteResponseDtoOutputStopsInnerRoleEnum
    _$routeResponseDtoOutputStopsInnerRoleEnum_ORIGIN =
    const RouteResponseDtoOutputStopsInnerRoleEnum._('ORIGIN');
const RouteResponseDtoOutputStopsInnerRoleEnum
    _$routeResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE =
    const RouteResponseDtoOutputStopsInnerRoleEnum._('INTERMEDIATE');
const RouteResponseDtoOutputStopsInnerRoleEnum
    _$routeResponseDtoOutputStopsInnerRoleEnum_DESTINATION =
    const RouteResponseDtoOutputStopsInnerRoleEnum._('DESTINATION');

RouteResponseDtoOutputStopsInnerRoleEnum
    _$routeResponseDtoOutputStopsInnerRoleEnumValueOf(String name) {
  switch (name) {
    case 'ORIGIN':
      return _$routeResponseDtoOutputStopsInnerRoleEnum_ORIGIN;
    case 'INTERMEDIATE':
      return _$routeResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE;
    case 'DESTINATION':
      return _$routeResponseDtoOutputStopsInnerRoleEnum_DESTINATION;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RouteResponseDtoOutputStopsInnerRoleEnum>
    _$routeResponseDtoOutputStopsInnerRoleEnumValues = BuiltSet<
        RouteResponseDtoOutputStopsInnerRoleEnum>(const <RouteResponseDtoOutputStopsInnerRoleEnum>[
  _$routeResponseDtoOutputStopsInnerRoleEnum_ORIGIN,
  _$routeResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE,
  _$routeResponseDtoOutputStopsInnerRoleEnum_DESTINATION,
]);

Serializer<RouteResponseDtoOutputStopsInnerRoleEnum>
    _$routeResponseDtoOutputStopsInnerRoleEnumSerializer =
    _$RouteResponseDtoOutputStopsInnerRoleEnumSerializer();

class _$RouteResponseDtoOutputStopsInnerRoleEnumSerializer
    implements PrimitiveSerializer<RouteResponseDtoOutputStopsInnerRoleEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ORIGIN': 'ORIGIN',
    'INTERMEDIATE': 'INTERMEDIATE',
    'DESTINATION': 'DESTINATION',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ORIGIN': 'ORIGIN',
    'INTERMEDIATE': 'INTERMEDIATE',
    'DESTINATION': 'DESTINATION',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RouteResponseDtoOutputStopsInnerRoleEnum
  ];
  @override
  final String wireName = 'RouteResponseDtoOutputStopsInnerRoleEnum';

  @override
  Object serialize(Serializers serializers,
          RouteResponseDtoOutputStopsInnerRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RouteResponseDtoOutputStopsInnerRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RouteResponseDtoOutputStopsInnerRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RouteResponseDtoOutputStopsInner
    extends RouteResponseDtoOutputStopsInner {
  @override
  final int sequence;
  @override
  final RouteResponseDtoOutputStopsInnerRoleEnum role;
  @override
  final String? catalogStopPointId;
  @override
  final String? stopPointId;
  @override
  final String name;
  @override
  final String address;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? note;
  @override
  final int? distanceMetersFromPrevious;
  @override
  final int? durationSecondsFromPrevious;

  factory _$RouteResponseDtoOutputStopsInner(
          [void Function(RouteResponseDtoOutputStopsInnerBuilder)? updates]) =>
      (RouteResponseDtoOutputStopsInnerBuilder()..update(updates))._build();

  _$RouteResponseDtoOutputStopsInner._(
      {required this.sequence,
      required this.role,
      this.catalogStopPointId,
      this.stopPointId,
      required this.name,
      required this.address,
      required this.latitude,
      required this.longitude,
      this.note,
      this.distanceMetersFromPrevious,
      this.durationSecondsFromPrevious})
      : super._();
  @override
  RouteResponseDtoOutputStopsInner rebuild(
          void Function(RouteResponseDtoOutputStopsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RouteResponseDtoOutputStopsInnerBuilder toBuilder() =>
      RouteResponseDtoOutputStopsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RouteResponseDtoOutputStopsInner &&
        sequence == other.sequence &&
        role == other.role &&
        catalogStopPointId == other.catalogStopPointId &&
        stopPointId == other.stopPointId &&
        name == other.name &&
        address == other.address &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        note == other.note &&
        distanceMetersFromPrevious == other.distanceMetersFromPrevious &&
        durationSecondsFromPrevious == other.durationSecondsFromPrevious;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sequence.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, catalogStopPointId.hashCode);
    _$hash = $jc(_$hash, stopPointId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, distanceMetersFromPrevious.hashCode);
    _$hash = $jc(_$hash, durationSecondsFromPrevious.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RouteResponseDtoOutputStopsInner')
          ..add('sequence', sequence)
          ..add('role', role)
          ..add('catalogStopPointId', catalogStopPointId)
          ..add('stopPointId', stopPointId)
          ..add('name', name)
          ..add('address', address)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('note', note)
          ..add('distanceMetersFromPrevious', distanceMetersFromPrevious)
          ..add('durationSecondsFromPrevious', durationSecondsFromPrevious))
        .toString();
  }
}

class RouteResponseDtoOutputStopsInnerBuilder
    implements
        Builder<RouteResponseDtoOutputStopsInner,
            RouteResponseDtoOutputStopsInnerBuilder> {
  _$RouteResponseDtoOutputStopsInner? _$v;

  int? _sequence;
  int? get sequence => _$this._sequence;
  set sequence(int? sequence) => _$this._sequence = sequence;

  RouteResponseDtoOutputStopsInnerRoleEnum? _role;
  RouteResponseDtoOutputStopsInnerRoleEnum? get role => _$this._role;
  set role(RouteResponseDtoOutputStopsInnerRoleEnum? role) =>
      _$this._role = role;

  String? _catalogStopPointId;
  String? get catalogStopPointId => _$this._catalogStopPointId;
  set catalogStopPointId(String? catalogStopPointId) =>
      _$this._catalogStopPointId = catalogStopPointId;

  String? _stopPointId;
  String? get stopPointId => _$this._stopPointId;
  set stopPointId(String? stopPointId) => _$this._stopPointId = stopPointId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  int? _distanceMetersFromPrevious;
  int? get distanceMetersFromPrevious => _$this._distanceMetersFromPrevious;
  set distanceMetersFromPrevious(int? distanceMetersFromPrevious) =>
      _$this._distanceMetersFromPrevious = distanceMetersFromPrevious;

  int? _durationSecondsFromPrevious;
  int? get durationSecondsFromPrevious => _$this._durationSecondsFromPrevious;
  set durationSecondsFromPrevious(int? durationSecondsFromPrevious) =>
      _$this._durationSecondsFromPrevious = durationSecondsFromPrevious;

  RouteResponseDtoOutputStopsInnerBuilder() {
    RouteResponseDtoOutputStopsInner._defaults(this);
  }

  RouteResponseDtoOutputStopsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sequence = $v.sequence;
      _role = $v.role;
      _catalogStopPointId = $v.catalogStopPointId;
      _stopPointId = $v.stopPointId;
      _name = $v.name;
      _address = $v.address;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _note = $v.note;
      _distanceMetersFromPrevious = $v.distanceMetersFromPrevious;
      _durationSecondsFromPrevious = $v.durationSecondsFromPrevious;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RouteResponseDtoOutputStopsInner other) {
    _$v = other as _$RouteResponseDtoOutputStopsInner;
  }

  @override
  void update(void Function(RouteResponseDtoOutputStopsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RouteResponseDtoOutputStopsInner build() => _build();

  _$RouteResponseDtoOutputStopsInner _build() {
    final _$result = _$v ??
        _$RouteResponseDtoOutputStopsInner._(
          sequence: BuiltValueNullFieldError.checkNotNull(
              sequence, r'RouteResponseDtoOutputStopsInner', 'sequence'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'RouteResponseDtoOutputStopsInner', 'role'),
          catalogStopPointId: catalogStopPointId,
          stopPointId: stopPointId,
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RouteResponseDtoOutputStopsInner', 'name'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'RouteResponseDtoOutputStopsInner', 'address'),
          latitude: BuiltValueNullFieldError.checkNotNull(
              latitude, r'RouteResponseDtoOutputStopsInner', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(
              longitude, r'RouteResponseDtoOutputStopsInner', 'longitude'),
          note: note,
          distanceMetersFromPrevious: distanceMetersFromPrevious,
          durationSecondsFromPrevious: durationSecondsFromPrevious,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
